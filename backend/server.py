from fastapi import FastAPI, APIRouter, HTTPException, Depends
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import random
import hashlib
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Literal
import uuid
from datetime import datetime, timezone, timedelta

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

# ==================== PERSONA GENERATION ====================
ADJECTIVES = [
    "Curious", "Silent", "Bold", "Clever", "Witty", "Gentle", "Swift", "Bright", "Calm", "Wise",
    "Happy", "Lucky", "Noble", "Brave", "Sunny", "Cozy", "Merry", "Jolly", "Lively", "Keen",
    "Eager", "Fancy", "Quirky", "Zesty", "Serene", "Vivid", "Chill", "Cool", "Crisp", "Fresh",
    "Gleeful", "Golden", "Grand", "Honest", "Humble", "Jazzy", "Jovial", "Kind", "Mystic", "Neat",
    "Peaceful", "Playful", "Polite", "Proud", "Quick", "Radiant", "Royal", "Savvy", "Sharp", "Sleek",
    "Smooth", "Snappy", "Sparkly", "Spirited", "Steady", "Stellar", "Strong", "Subtle", "Super", "Sweet",
    "Tender", "Thoughtful", "Tidy", "Tranquil", "Trendy", "Trusty", "Upbeat", "Urban", "Velvet", "Vibrant",
    "Warm", "Wild", "Windy", "Witty", "Wonder", "Youthful", "Zealous", "Zen", "Zippy", "Artful",
    "Breezy", "Bubbly", "Charming", "Cosmic", "Dapper", "Daring", "Dreamy", "Dynamic", "Elegant", "Epic",
    "Fiery", "Funky", "Groovy", "Hidden", "Lunar", "Midnight", "Neon", "Pixel", "Retro", "Secret"
]

NOUNS = [
    "Owl", "Falcon", "Phoenix", "Tiger", "Panda", "Dolphin", "Eagle", "Wolf", "Bear", "Fox",
    "Hawk", "Raven", "Swan", "Deer", "Lion", "Lynx", "Otter", "Badger", "Heron", "Crane",
    "Mango", "Cedar", "Maple", "Oak", "Pine", "Birch", "Willow", "Bamboo", "Palm", "Fern",
    "River", "Mountain", "Valley", "Meadow", "Forest", "Ocean", "Cloud", "Storm", "Thunder", "Rain",
    "Balcony", "Garden", "Terrace", "Patio", "Gazebo", "Porch", "Veranda", "Arbor", "Grove", "Orchard",
    "Crystal", "Diamond", "Ruby", "Emerald", "Sapphire", "Pearl", "Opal", "Jade", "Amber", "Onyx",
    "Breeze", "Flame", "Frost", "Glow", "Spark", "Wave", "Tide", "Dusk", "Dawn", "Twilight",
    "Comet", "Star", "Moon", "Nova", "Galaxy", "Nebula", "Orbit", "Cosmos", "Aurora", "Eclipse",
    "Knight", "Sage", "Scout", "Ranger", "Pioneer", "Voyager", "Nomad", "Wanderer", "Explorer", "Keeper",
    "Arrow", "Shield", "Compass", "Anchor", "Beacon", "Lantern", "Prism", "Mirror", "Canvas", "Mosaic"
]

def generate_persona_name():
    adj = random.choice(ADJECTIVES)
    noun = random.choice(NOUNS)
    num = random.randint(10, 99)
    return f"{adj}{noun}{num}"

def generate_persona_color(persona_name: str):
    colors = ["#6366F1", "#8B5CF6", "#EC4899", "#F43F5E", "#F97316", "#EAB308", "#22C55E", "#14B8A6", "#06B6D4", "#3B82F6"]
    hash_val = int(hashlib.md5(persona_name.encode()).hexdigest()[:8], 16)
    return colors[hash_val % len(colors)]

def hash_mobile(mobile: str) -> str:
    salt = "societysocials_salt_2024"
    return hashlib.sha256(f"{salt}{mobile}".encode()).hexdigest()

# ==================== MODELS ====================
class UserBase(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    mobile_hash: str
    society_id: Optional[str] = None
    persona_name: str
    persona_color: str
    is_admin: bool = False
    is_banned: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserResponse(BaseModel):
    id: str
    society_id: Optional[str]
    persona_name: str
    persona_color: str
    is_admin: bool

class LoginRequest(BaseModel):
    mobile_number: str

class LoginResponse(BaseModel):
    user: UserResponse
    is_new: bool

class SocietyBase(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    city: str
    locality: str
    total_units: int
    is_active: bool = True

class SocietyResponse(BaseModel):
    id: str
    name: str
    city: str
    locality: str
    total_units: int

class SelectSocietyRequest(BaseModel):
    society_id: str

class PostCreate(BaseModel):
    post_type: Literal['discussion', 'question', 'poll']
    title: str
    body: Optional[str] = None
    poll_options: Optional[List[str]] = None
    poll_visibility: Literal['realtime', 'on_close'] = 'realtime'

class PollOptionResponse(BaseModel):
    id: str
    option_text: str
    vote_count: int

class PostResponse(BaseModel):
    id: str
    society_id: str
    author_id: str
    author_name: str
    author_color: str
    post_type: str
    title: str
    body: Optional[str]
    created_at: str
    is_pinned: bool
    is_removed: bool
    report_count: int
    poll_visibility: Optional[str]
    poll_closed_at: Optional[str]
    poll_options: Optional[List[PollOptionResponse]]
    reactions: dict
    comment_count: int
    user_reaction: Optional[str] = None
    user_voted_option: Optional[str] = None

class CommentCreate(BaseModel):
    body: str

class CommentResponse(BaseModel):
    id: str
    post_id: str
    author_id: str
    author_name: str
    author_color: str
    body: str
    created_at: str
    is_removed: bool

class ReactionCreate(BaseModel):
    reaction_type: Literal['agree', 'interesting', 'me_too']

class VoteCreate(BaseModel):
    option_id: str

class ReportCreate(BaseModel):
    target_type: Literal['post', 'comment']
    target_id: str
    reason: Literal['abusive', 'spam', 'doxxing', 'misinformation', 'other']

# ==================== SEED DATA ====================
SEED_SOCIETIES = [
    {"name": "Sobha Dream Acres", "locality": "Marathahalli", "city": "Bengaluru", "total_units": 1200},
    {"name": "Prestige Shantiniketan", "locality": "Whitefield", "city": "Bengaluru", "total_units": 3000},
    {"name": "Brigade Orchards", "locality": "Devanahalli", "city": "Bengaluru", "total_units": 1500},
    {"name": "Godrej Woodsman Estate", "locality": "Hebbal", "city": "Bengaluru", "total_units": 800},
    {"name": "Embassy Springs", "locality": "Devanahalli", "city": "Bengaluru", "total_units": 2000},
    {"name": "Mantri Webcity", "locality": "Hennur", "city": "Bengaluru", "total_units": 1100},
    {"name": "RMZ Galleria", "locality": "Yelahanka", "city": "Bengaluru", "total_units": 600},
    {"name": "Salarpuria Sattva Divinity", "locality": "RR Nagar", "city": "Bengaluru", "total_units": 900},
    {"name": "Provident Welworth City", "locality": "Doddaballapur", "city": "Bengaluru", "total_units": 700},
    {"name": "Purva Panorama", "locality": "Bannerghatta Road", "city": "Bengaluru", "total_units": 1000}
]

async def seed_societies():
    count = await db.societies.count_documents({})
    if count == 0:
        for s in SEED_SOCIETIES:
            society = SocietyBase(**s)
            doc = society.model_dump()
            doc['created_at'] = doc['created_at'].isoformat() if 'created_at' in doc else datetime.now(timezone.utc).isoformat()
            await db.societies.insert_one(doc)
        logging.info("Seeded 10 societies")

# Demo account constant
DEMO_USER_ID = "demo-user-12345"
DEMO_MOBILE_HASH = hash_mobile("0000000000")

SAMPLE_POSTS = [
    {
        "post_type": "discussion",
        "title": "Weekend parking rules getting too strict?",
        "body": "Has anyone else noticed the new parking restrictions? Guests are being charged even for short visits now. What do you all think about this?"
    },
    {
        "post_type": "question",
        "title": "Best internet provider in our society?",
        "body": "Moving in next week and need to set up WiFi. Which provider works best here - ACT, Airtel, or JioFiber? Looking for reliable speed for WFH."
    },
    {
        "post_type": "poll",
        "title": "Should we organize a Holi celebration this year?",
        "body": None,
        "poll_options": ["Yes, in the common area", "Yes, but only dry colors", "No, keep it individual", "Maybe next year"],
        "poll_visibility": "realtime"
    },
    {
        "post_type": "discussion",
        "title": "Dog owners - please pick up after your pets! 🐕",
        "body": "I love dogs but finding surprises on the walking track is not fun. Can we please be responsible pet owners? Maybe the RWA can install more waste bins?"
    },
    {
        "post_type": "question",
        "title": "Anyone know a good plumber?",
        "body": "Kitchen sink has been leaking for days. The society maintenance is taking too long. Any recommendations for a reliable plumber nearby?"
    },
    {
        "post_type": "poll",
        "title": "Best time for gym slot booking?",
        "body": None,
        "poll_options": ["6-8 AM", "8-10 AM", "5-7 PM", "7-9 PM"],
        "poll_visibility": "realtime"
    },
    {
        "post_type": "discussion",
        "title": "Power backup during outages has been amazing lately",
        "body": "Just wanted to appreciate the maintenance team. The generator switchover is now seamless. Great improvement from last year!"
    },
    {
        "post_type": "question", 
        "title": "Is the swimming pool opening this summer?",
        "body": "Heard some rumors about renovations. Does anyone have official info from the RWA about when the pool will be operational?"
    }
]

async def create_demo_account():
    """Create or get demo account"""
    existing = await db.users.find_one({"id": DEMO_USER_ID}, {"_id": 0})
    if existing:
        return existing
    
    # Create demo user
    demo_user = {
        "id": DEMO_USER_ID,
        "mobile_hash": DEMO_MOBILE_HASH,
        "society_id": None,  # Will be set to first society
        "persona_name": "DemoExplorer42",
        "persona_color": "#6366F1",
        "is_admin": False,
        "is_banned": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(demo_user)
    return demo_user

async def seed_demo_posts(society_id: str):
    """Seed sample posts for a society if none exist"""
    existing_posts = await db.posts.count_documents({"society_id": society_id})
    if existing_posts > 0:
        return
    
    # Create demo personas for variety
    demo_personas = [
        ("CuriousOwl87", "#8B5CF6"),
        ("SilentMango23", "#EC4899"),
        ("BoldPhoenix45", "#F97316"),
        ("CleverRaven91", "#22C55E"),
        ("WittyPanda33", "#06B6D4"),
        ("GentleFox67", "#3B82F6"),
        ("SwiftEagle12", "#EAB308"),
        ("BrightStar55", "#14B8A6")
    ]
    
    # Create demo users for posts
    demo_authors = []
    for i, (name, color) in enumerate(demo_personas):
        author_id = f"demo-author-{i}"
        existing_author = await db.users.find_one({"id": author_id}, {"_id": 0})
        if not existing_author:
            await db.users.insert_one({
                "id": author_id,
                "mobile_hash": hash_mobile(f"111111111{i}"),
                "society_id": society_id,
                "persona_name": name,
                "persona_color": color,
                "is_admin": False,
                "is_banned": False,
                "created_at": datetime.now(timezone.utc).isoformat()
            })
        demo_authors.append({"id": author_id, "name": name, "color": color})
    
    # Create sample posts
    for i, post_data in enumerate(SAMPLE_POSTS):
        author = demo_authors[i % len(demo_authors)]
        post_id = str(uuid.uuid4())
        
        # Vary creation times for realistic feel
        hours_ago = random.randint(1, 72)
        created_at = datetime.now(timezone.utc) - timedelta(hours=hours_ago)
        
        poll_options = []
        if post_data["post_type"] == "poll" and post_data.get("poll_options"):
            for opt_text in post_data["poll_options"]:
                poll_options.append({
                    "id": str(uuid.uuid4()),
                    "option_text": opt_text,
                    "vote_count": random.randint(2, 15)
                })
        
        post_doc = {
            "id": post_id,
            "society_id": society_id,
            "author_id": author["id"],
            "post_type": post_data["post_type"],
            "title": post_data["title"],
            "body": post_data.get("body"),
            "created_at": created_at.isoformat(),
            "is_pinned": False,
            "is_removed": False,
            "report_count": 0,
            "poll_visibility": post_data.get("poll_visibility", "realtime") if post_data["post_type"] == "poll" else None,
            "poll_closed_at": None,
            "poll_options": poll_options if poll_options else None,
            "reactions": {
                "agree": random.randint(0, 12),
                "interesting": random.randint(0, 8),
                "me_too": random.randint(0, 6)
            }
        }
        await db.posts.insert_one(post_doc)
        
        # Add some sample comments
        num_comments = random.randint(0, 3)
        for j in range(num_comments):
            comment_author = random.choice(demo_authors)
            comment_texts = [
                "Totally agree with this!",
                "Thanks for bringing this up.",
                "Has anyone contacted the RWA about this?",
                "Same issue in my block too.",
                "Great point, we should discuss this in the next meeting.",
                "+1, facing the same problem",
                "This has been going on for weeks now.",
                "Finally someone said it!"
            ]
            await db.comments.insert_one({
                "id": str(uuid.uuid4()),
                "post_id": post_id,
                "author_id": comment_author["id"],
                "body": random.choice(comment_texts),
                "created_at": (created_at + timedelta(hours=random.randint(1, 12))).isoformat(),
                "is_removed": False,
                "report_count": 0
            })
    
    logging.info(f"Seeded {len(SAMPLE_POSTS)} sample posts for society {society_id}")

# ==================== AUTH ENDPOINTS ====================
@api_router.post("/auth/login", response_model=LoginResponse)
async def login(req: LoginRequest):
    if not req.mobile_number or len(req.mobile_number) != 10 or not req.mobile_number.isdigit():
        raise HTTPException(status_code=400, detail="Invalid mobile number. Must be 10 digits.")
    
    mobile_hash = hash_mobile(req.mobile_number)
    existing = await db.users.find_one({"mobile_hash": mobile_hash}, {"_id": 0})
    
    if existing:
        return LoginResponse(
            user=UserResponse(
                id=existing['id'],
                society_id=existing.get('society_id'),
                persona_name=existing['persona_name'],
                persona_color=existing['persona_color'],
                is_admin=existing.get('is_admin', False)
            ),
            is_new=False
        )
    
    persona_name = generate_persona_name()
    persona_color = generate_persona_color(persona_name)
    
    user = UserBase(
        mobile_hash=mobile_hash,
        persona_name=persona_name,
        persona_color=persona_color
    )
    doc = user.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.users.insert_one(doc)
    
    return LoginResponse(
        user=UserResponse(
            id=user.id,
            society_id=None,
            persona_name=persona_name,
            persona_color=persona_color,
            is_admin=False
        ),
        is_new=True
    )

@api_router.get("/users/{user_id}", response_model=UserResponse)
async def get_user(user_id: str):
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return UserResponse(
        id=user['id'],
        society_id=user.get('society_id'),
        persona_name=user['persona_name'],
        persona_color=user['persona_color'],
        is_admin=user.get('is_admin', False)
    )

@api_router.put("/users/{user_id}/society")
async def select_society(user_id: str, req: SelectSocietyRequest):
    society = await db.societies.find_one({"id": req.society_id}, {"_id": 0})
    if not society:
        raise HTTPException(status_code=404, detail="Society not found")
    
    result = await db.users.update_one(
        {"id": user_id},
        {"$set": {"society_id": req.society_id}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Seed sample posts for this society
    await seed_demo_posts(req.society_id)
    
    return {"success": True, "society": society}

# Demo account endpoint
@api_router.post("/auth/demo")
async def login_demo():
    """Login with demo account - pre-populated with sample data"""
    await seed_societies()
    
    # Get first society
    first_society = await db.societies.find_one({}, {"_id": 0})
    if not first_society:
        raise HTTPException(status_code=500, detail="No societies available")
    
    # Create or get demo user
    demo_user = await create_demo_account()
    
    # Update demo user's society
    await db.users.update_one(
        {"id": DEMO_USER_ID},
        {"$set": {"society_id": first_society["id"]}}
    )
    
    # Seed posts for the demo society
    await seed_demo_posts(first_society["id"])
    
    return {
        "user": UserResponse(
            id=DEMO_USER_ID,
            society_id=first_society["id"],
            persona_name="DemoExplorer42",
            persona_color="#6366F1",
            is_admin=False
        ),
        "is_new": False,
        "is_demo": True
    }

# ==================== SOCIETIES ENDPOINTS ====================
@api_router.get("/societies", response_model=List[SocietyResponse])
async def get_societies(search: Optional[str] = None):
    await seed_societies()
    query = {}
    if search:
        query = {"$or": [
            {"name": {"$regex": search, "$options": "i"}},
            {"locality": {"$regex": search, "$options": "i"}}
        ]}
    societies = await db.societies.find(query, {"_id": 0}).to_list(100)
    return societies

# ==================== POSTS ENDPOINTS ====================
@api_router.post("/posts", response_model=PostResponse)
async def create_post(post: PostCreate, user_id: str):
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if not user.get('society_id'):
        raise HTTPException(status_code=400, detail="User must select a society first")
    if user.get('is_banned'):
        raise HTTPException(status_code=403, detail="User is banned")
    
    if len(post.title) > 200:
        raise HTTPException(status_code=400, detail="Title too long (max 200)")
    if post.body and len(post.body) > 1000:
        raise HTTPException(status_code=400, detail="Body too long (max 1000)")
    
    post_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc)
    
    poll_options = []
    if post.post_type == 'poll':
        if not post.poll_options or len(post.poll_options) < 2:
            raise HTTPException(status_code=400, detail="Poll must have at least 2 options")
        if len(post.poll_options) > 4:
            raise HTTPException(status_code=400, detail="Poll can have max 4 options")
        for opt_text in post.poll_options:
            poll_options.append({
                "id": str(uuid.uuid4()),
                "option_text": opt_text[:100],
                "vote_count": 0
            })
    
    post_doc = {
        "id": post_id,
        "society_id": user['society_id'],
        "author_id": user_id,
        "post_type": post.post_type,
        "title": post.title,
        "body": post.body,
        "created_at": now.isoformat(),
        "is_pinned": False,
        "is_removed": False,
        "report_count": 0,
        "poll_visibility": post.poll_visibility if post.post_type == 'poll' else None,
        "poll_closed_at": None,
        "poll_options": poll_options if post.post_type == 'poll' else None,
        "reactions": {"agree": 0, "interesting": 0, "me_too": 0}
    }
    
    await db.posts.insert_one(post_doc)
    
    comment_count = await db.comments.count_documents({"post_id": post_id, "is_removed": False})
    
    return PostResponse(
        id=post_id,
        society_id=user['society_id'],
        author_id=user_id,
        author_name=user['persona_name'],
        author_color=user['persona_color'],
        post_type=post.post_type,
        title=post.title,
        body=post.body,
        created_at=now.isoformat(),
        is_pinned=False,
        is_removed=False,
        report_count=0,
        poll_visibility=post_doc['poll_visibility'],
        poll_closed_at=None,
        poll_options=[PollOptionResponse(**o) for o in poll_options] if poll_options else None,
        reactions=post_doc['reactions'],
        comment_count=comment_count
    )

@api_router.get("/posts", response_model=List[PostResponse])
async def get_posts(society_id: str, user_id: str, sort: str = "latest"):
    posts = []
    query = {"society_id": society_id, "is_removed": False}
    
    if sort == "popular":
        pipeline = [
            {"$match": query},
            {"$addFields": {
                "score": {
                    "$add": [
                        {"$multiply": [{"$add": [
                            {"$ifNull": ["$reactions.agree", 0]},
                            {"$ifNull": ["$reactions.interesting", 0]},
                            {"$ifNull": ["$reactions.me_too", 0]}
                        ]}, 2]},
                        0
                    ]
                }
            }},
            {"$sort": {"score": -1, "created_at": -1}},
            {"$limit": 50},
            {"$project": {"_id": 0}}
        ]
        post_docs = await db.posts.aggregate(pipeline).to_list(50)
    else:
        post_docs = await db.posts.find(query, {"_id": 0}).sort("created_at", -1).to_list(50)
    
    for post in post_docs:
        author = await db.users.find_one({"id": post['author_id']}, {"_id": 0})
        if not author:
            continue
        
        comment_count = await db.comments.count_documents({"post_id": post['id'], "is_removed": False})
        
        user_reaction = await db.reactions.find_one({"post_id": post['id'], "user_id": user_id}, {"_id": 0})
        user_voted = await db.votes.find_one({"post_id": post['id'], "voter_id": user_id}, {"_id": 0})
        
        posts.append(PostResponse(
            id=post['id'],
            society_id=post['society_id'],
            author_id=post['author_id'],
            author_name=author['persona_name'],
            author_color=author['persona_color'],
            post_type=post['post_type'],
            title=post['title'],
            body=post.get('body'),
            created_at=post['created_at'],
            is_pinned=post.get('is_pinned', False),
            is_removed=False,
            report_count=post.get('report_count', 0),
            poll_visibility=post.get('poll_visibility'),
            poll_closed_at=post.get('poll_closed_at'),
            poll_options=[PollOptionResponse(**o) for o in post['poll_options']] if post.get('poll_options') else None,
            reactions=post.get('reactions', {"agree": 0, "interesting": 0, "me_too": 0}),
            comment_count=comment_count,
            user_reaction=user_reaction['reaction_type'] if user_reaction else None,
            user_voted_option=user_voted['option_id'] if user_voted else None
        ))
    
    return posts

@api_router.get("/posts/{post_id}", response_model=PostResponse)
async def get_post(post_id: str, user_id: str):
    post = await db.posts.find_one({"id": post_id}, {"_id": 0})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    author = await db.users.find_one({"id": post['author_id']}, {"_id": 0})
    comment_count = await db.comments.count_documents({"post_id": post_id, "is_removed": False})
    user_reaction = await db.reactions.find_one({"post_id": post_id, "user_id": user_id}, {"_id": 0})
    user_voted = await db.votes.find_one({"post_id": post_id, "voter_id": user_id}, {"_id": 0})
    
    return PostResponse(
        id=post['id'],
        society_id=post['society_id'],
        author_id=post['author_id'],
        author_name=author['persona_name'] if author else "Unknown",
        author_color=author['persona_color'] if author else "#6366F1",
        post_type=post['post_type'],
        title=post['title'],
        body=post.get('body'),
        created_at=post['created_at'],
        is_pinned=post.get('is_pinned', False),
        is_removed=post.get('is_removed', False),
        report_count=post.get('report_count', 0),
        poll_visibility=post.get('poll_visibility'),
        poll_closed_at=post.get('poll_closed_at'),
        poll_options=[PollOptionResponse(**o) for o in post['poll_options']] if post.get('poll_options') else None,
        reactions=post.get('reactions', {"agree": 0, "interesting": 0, "me_too": 0}),
        comment_count=comment_count,
        user_reaction=user_reaction['reaction_type'] if user_reaction else None,
        user_voted_option=user_voted['option_id'] if user_voted else None
    )

@api_router.post("/posts/{post_id}/close-poll")
async def close_poll(post_id: str, user_id: str):
    post = await db.posts.find_one({"id": post_id}, {"_id": 0})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    if post['author_id'] != user_id:
        raise HTTPException(status_code=403, detail="Only author can close poll")
    if post['post_type'] != 'poll':
        raise HTTPException(status_code=400, detail="Not a poll")
    
    await db.posts.update_one(
        {"id": post_id},
        {"$set": {"poll_closed_at": datetime.now(timezone.utc).isoformat()}}
    )
    return {"success": True}

# ==================== REACTIONS ENDPOINTS ====================
@api_router.post("/posts/{post_id}/reactions")
async def add_reaction(post_id: str, reaction: ReactionCreate, user_id: str):
    existing = await db.reactions.find_one({"post_id": post_id, "user_id": user_id}, {"_id": 0})
    
    if existing:
        old_type = existing['reaction_type']
        if old_type == reaction.reaction_type:
            await db.reactions.delete_one({"post_id": post_id, "user_id": user_id})
            await db.posts.update_one(
                {"id": post_id},
                {"$inc": {f"reactions.{old_type}": -1}}
            )
            return {"success": True, "action": "removed"}
        else:
            await db.reactions.update_one(
                {"post_id": post_id, "user_id": user_id},
                {"$set": {"reaction_type": reaction.reaction_type}}
            )
            await db.posts.update_one(
                {"id": post_id},
                {"$inc": {f"reactions.{old_type}": -1, f"reactions.{reaction.reaction_type}": 1}}
            )
            return {"success": True, "action": "changed"}
    else:
        await db.reactions.insert_one({
            "id": str(uuid.uuid4()),
            "post_id": post_id,
            "user_id": user_id,
            "reaction_type": reaction.reaction_type
        })
        await db.posts.update_one(
            {"id": post_id},
            {"$inc": {f"reactions.{reaction.reaction_type}": 1}}
        )
        return {"success": True, "action": "added"}

# ==================== VOTES ENDPOINTS ====================
@api_router.post("/posts/{post_id}/votes")
async def vote_poll(post_id: str, vote: VoteCreate, user_id: str):
    post = await db.posts.find_one({"id": post_id}, {"_id": 0})
    if not post or post['post_type'] != 'poll':
        raise HTTPException(status_code=404, detail="Poll not found")
    if post.get('poll_closed_at'):
        raise HTTPException(status_code=400, detail="Poll is closed")
    
    existing_vote = await db.votes.find_one({"post_id": post_id, "voter_id": user_id}, {"_id": 0})
    if existing_vote:
        raise HTTPException(status_code=400, detail="Already voted")
    
    valid_option = any(o['id'] == vote.option_id for o in post.get('poll_options', []))
    if not valid_option:
        raise HTTPException(status_code=400, detail="Invalid option")
    
    await db.votes.insert_one({
        "id": str(uuid.uuid4()),
        "post_id": post_id,
        "option_id": vote.option_id,
        "voter_id": user_id,
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    await db.posts.update_one(
        {"id": post_id, "poll_options.id": vote.option_id},
        {"$inc": {"poll_options.$.vote_count": 1}}
    )
    
    return {"success": True}

# ==================== COMMENTS ENDPOINTS ====================
@api_router.post("/posts/{post_id}/comments", response_model=CommentResponse)
async def create_comment(post_id: str, comment: CommentCreate, user_id: str):
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.get('is_banned'):
        raise HTTPException(status_code=403, detail="User is banned")
    
    if len(comment.body) > 500:
        raise HTTPException(status_code=400, detail="Comment too long (max 500)")
    
    comment_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc)
    
    comment_doc = {
        "id": comment_id,
        "post_id": post_id,
        "author_id": user_id,
        "body": comment.body,
        "created_at": now.isoformat(),
        "is_removed": False,
        "report_count": 0
    }
    
    await db.comments.insert_one(comment_doc)
    
    return CommentResponse(
        id=comment_id,
        post_id=post_id,
        author_id=user_id,
        author_name=user['persona_name'],
        author_color=user['persona_color'],
        body=comment.body,
        created_at=now.isoformat(),
        is_removed=False
    )

@api_router.get("/posts/{post_id}/comments", response_model=List[CommentResponse])
async def get_comments(post_id: str):
    comments = await db.comments.find({"post_id": post_id, "is_removed": False}, {"_id": 0}).sort("created_at", 1).to_list(100)
    
    result = []
    for c in comments:
        author = await db.users.find_one({"id": c['author_id']}, {"_id": 0})
        result.append(CommentResponse(
            id=c['id'],
            post_id=c['post_id'],
            author_id=c['author_id'],
            author_name=author['persona_name'] if author else "Unknown",
            author_color=author['persona_color'] if author else "#6366F1",
            body=c['body'],
            created_at=c['created_at'],
            is_removed=c['is_removed']
        ))
    
    return result

# ==================== REPORTS ENDPOINTS ====================
@api_router.post("/reports")
async def create_report(report: ReportCreate, user_id: str):
    existing = await db.reports.find_one({
        "reporter_id": user_id,
        "target_type": report.target_type,
        "target_id": report.target_id
    }, {"_id": 0})
    
    if existing:
        raise HTTPException(status_code=400, detail="Already reported")
    
    await db.reports.insert_one({
        "id": str(uuid.uuid4()),
        "reporter_id": user_id,
        "target_type": report.target_type,
        "target_id": report.target_id,
        "reason": report.reason,
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    if report.target_type == 'post':
        await db.posts.update_one(
            {"id": report.target_id},
            {"$inc": {"report_count": 1}}
        )
        post = await db.posts.find_one({"id": report.target_id}, {"_id": 0})
        if post and post.get('report_count', 0) >= 5:
            await db.posts.update_one({"id": report.target_id}, {"$set": {"is_removed": True}})
    else:
        await db.comments.update_one(
            {"id": report.target_id},
            {"$inc": {"report_count": 1}}
        )
        comment = await db.comments.find_one({"id": report.target_id}, {"_id": 0})
        if comment and comment.get('report_count', 0) >= 3:
            await db.comments.update_one({"id": report.target_id}, {"$set": {"is_removed": True}})
    
    return {"success": True, "message": "Thanks, we'll review this"}

# ==================== USER POSTS HISTORY ====================
@api_router.get("/users/{user_id}/posts", response_model=List[PostResponse])
async def get_user_posts(user_id: str):
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    posts = await db.posts.find({"author_id": user_id, "is_removed": False}, {"_id": 0}).sort("created_at", -1).to_list(50)
    
    result = []
    for post in posts:
        comment_count = await db.comments.count_documents({"post_id": post['id'], "is_removed": False})
        result.append(PostResponse(
            id=post['id'],
            society_id=post['society_id'],
            author_id=post['author_id'],
            author_name=user['persona_name'],
            author_color=user['persona_color'],
            post_type=post['post_type'],
            title=post['title'],
            body=post.get('body'),
            created_at=post['created_at'],
            is_pinned=post.get('is_pinned', False),
            is_removed=False,
            report_count=post.get('report_count', 0),
            poll_visibility=post.get('poll_visibility'),
            poll_closed_at=post.get('poll_closed_at'),
            poll_options=[PollOptionResponse(**o) for o in post['poll_options']] if post.get('poll_options') else None,
            reactions=post.get('reactions', {"agree": 0, "interesting": 0, "me_too": 0}),
            comment_count=comment_count
        ))
    
    return result

# Root endpoint
@api_router.get("/")
async def root():
    return {"message": "SocietySocials API v1.0"}

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup():
    await seed_societies()

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
