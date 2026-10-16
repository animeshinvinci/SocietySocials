/**
 * DepSmith SDK (@depsmith/depsmith-sdk) — event ingest client.
 *
 * This file used to be a dependency-free reimplementation of the ingest wire
 * protocol, because the vendor package was not published to a registry we
 * could install from. It now is (0.7.0), so the hand-rolled client is gone and
 * this is a thin adapter over the real SDK.
 *
 * What the swap buys us, none of which the hand-rolled client had: retries with
 * a circuit breaker, a queue that survives a reload, gzip compression, session
 * tracking, consent/DNT handling, first-touch attribution (UTMs land as
 * context.campaign.* and reach the collector as $utm_source and friends), and
 * optional autocapture. The wire format is the SDK's own, so it cannot drift
 * from the collector the way a transcribed copy can.
 *
 * Auth is still the api_key in the request body — a public, append-only browser
 * write key by design, same posture as the hardcoded Amplitude key.
 *
 * The app never imports this directly: the generic helpers in lib/amplitude.js
 * fan out to it, so every tracked event is captured here with no per-call-site
 * changes. The exported names are deliberately unchanged from the hand-rolled
 * version for that reason.
 */
import { DepsmithSdk } from '@depsmith/depsmith-sdk';

const API_KEY =
  process.env.REACT_APP_POLARIS_BEACON_KEY ||
  'pb_4e32e41b1ca81e409c3ec44843db858ff3834bf5a2ec66ad';

// The SDK appends "/e/" to this base itself.
const ENDPOINT_BASE =
  process.env.REACT_APP_POLARIS_BEACON_ENDPOINT ||
  'https://demo.trydep.com/api/collect';

/**
 * Off by default, matching the Amplitude init right next to it
 * (`autocapture: false, defaultTracking: false`): every captured event in this
 * app is an explicit track() call, and turning autocapture on would change
 * event volume without anyone asking for it. Opt in per environment.
 */
const AUTOCAPTURE = process.env.REACT_APP_POLARIS_BEACON_AUTOCAPTURE === 'true';

const hasWindow = typeof window !== 'undefined';

let ready = false;

/**
 * Carry the existing visitor identity across the swap.
 *
 * The hand-rolled client stored its anonymous id under `beacon_anonymous_id`;
 * the SDK uses `depsmith_anonymous_id`. Without this, every returning
 * logged-out visitor would be counted as a brand-new person on the first load
 * after deploy. Copying the value (rather than emitting an $alias) keeps the id
 * itself stable, so no server-side stitching is needed.
 *
 * Runs only when the SDK has no id yet, which makes it idempotent — after the
 * first init the SDK's own key is set and this is a no-op. The legacy keys are
 * left in place deliberately: they cost nothing and survive a rollback.
 *
 * `beacon_user_id` needs no migration. UserContext calls identifyUser() on
 * every load that restores a stored user, so the SDK learns the user id from
 * the app rather than from storage.
 */
const migrateLegacyAnonymousId = () => {
  if (!hasWindow) return;
  try {
    const { localStorage: ls } = window;
    if (ls.getItem('depsmith_anonymous_id')) return;
    const legacy = ls.getItem('beacon_anonymous_id');
    if (legacy) ls.setItem('depsmith_anonymous_id', legacy);
  } catch (e) {
    /* private mode / quota — a fresh anonymous id is the acceptable fallback */
  }
};

export const initBeacon = () => {
  if (ready || !API_KEY) return;
  migrateLegacyAnonymousId();
  const client = DepsmithSdk.init({
    apiKey: API_KEY,
    endpoint: ENDPOINT_BASE.replace(/\/+$/, ''),
    autocapture: AUTOCAPTURE,
  });
  // init() returns null instead of throwing, so analytics can never take the
  // app down with it; everything below then degrades to a no-op.
  ready = client !== null;
};

export const identifyBeacon = (id) => {
  if (!ready || !id) return;
  DepsmithSdk.identify(String(id));
};

export const resetBeacon = () => {
  if (!ready) return;
  // Clears the user id and rotates the anonymous id, so events after logout are
  // not linked to the person who just left — same contract as before.
  DepsmithSdk.reset();
};

export const trackBeacon = (eventName, properties = {}) => {
  if (!ready) return;
  DepsmithSdk.track(eventName, properties);
};
