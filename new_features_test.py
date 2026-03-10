#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime
import time

class NewFeaturesAPITester:
    def __init__(self, base_url="https://neighborhood-buzz.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = {}

    def log_result(self, test_name, success, details=""):
        """Log test results"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {test_name} - PASSED")
        else:
            print(f"❌ {test_name} - FAILED: {details}")
        
        self.test_results[test_name] = {
            "success": success,
            "details": details
        }

    def run_test(self, name, method, endpoint, expected_status, data=None, params=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, params=params)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, params=params)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, params=params)

            success = response.status_code == expected_status
            details = f"Status: {response.status_code}"
            
            if not success:
                try:
                    error_data = response.json()
                    details += f", Error: {error_data.get('detail', 'Unknown error')}"
                except:
                    details += f", Response: {response.text[:100]}"

            self.log_result(name, success, details)
            
            if success:
                try:
                    return response.json()
                except:
                    return {}
            return None

        except Exception as e:
            self.log_result(name, False, f"Exception: {str(e)}")
            return None

    def test_new_societies_in_search(self):
        """Test that new societies appear in search results"""
        # Test general societies endpoint
        response = self.run_test("Get All Societies", "GET", "societies", 200)
        
        if not response:
            return False
            
        society_names = [s['name'] for s in response]
        print(f"   Found {len(response)} societies total")
        
        # Check for new societies mentioned in review request
        new_societies = [
            "Bren Zahara", 
            "SJR Blue Waters",
            "Bren Edgewaters", 
            "Oberoi Splendor", 
            "Test Society"
        ]
        
        found_new_societies = []
        for society in new_societies:
            if society in society_names:
                found_new_societies.append(society)
                print(f"   ✓ Found new society: {society}")
            else:
                print(f"   ✗ Missing new society: {society}")
        
        success = len(found_new_societies) >= 3  # At least 3 of 5 should be present
        self.log_result("New Societies Present", success, f"Found {len(found_new_societies)}/5 new societies")
        
        # Test specific search for new societies
        for society in ["Bren", "Oberoi", "Test"]:
            search_response = self.run_test(f"Search for '{society}'", "GET", "societies", 200, 
                                          params={"search": society})
            if search_response:
                found_names = [s['name'] for s in search_response]
                print(f"   Search '{society}' returned: {found_names}")
        
        return len(found_new_societies) >= 3

    def test_society_request_api(self):
        """Test society request functionality"""
        # Test requesting a new society
        request_data = {
            "name": "Test New Society Request",
            "locality": "Test Locality", 
            "city": "Test City",
            "total_units": 250
        }
        
        response = self.run_test("Request New Society", "POST", "societies/request", 200, request_data)
        
        if response:
            print(f"   Request submitted with ID: {response.get('request_id')}")
        
        # Test duplicate request (should fail)
        duplicate_response = self.run_test("Duplicate Society Request", "POST", "societies/request", 400, request_data)
        
        # Test get pending requests (admin endpoint)
        pending_response = self.run_test("Get Pending Requests", "GET", "societies/requests/pending", 200)
        
        if pending_response:
            print(f"   Found {len(pending_response)} pending requests")
        
        return response is not None

    def test_persona_functionality(self):
        """Test persona suggestions and availability checking"""
        # Test persona suggestions
        suggestions_response = self.run_test("Get Persona Suggestions", "GET", "persona/suggestions", 200, 
                                           params={"count": 4})
        
        if suggestions_response:
            suggestions = suggestions_response.get('suggestions', [])
            print(f"   Generated {len(suggestions)} suggestions: {suggestions}")
            
            if len(suggestions) == 4:
                self.log_result("4 Persona Suggestions", True, f"Got {len(suggestions)} suggestions")
            else:
                self.log_result("4 Persona Suggestions", False, f"Expected 4, got {len(suggestions)}")
            
            # Test availability checking for suggested names
            if suggestions:
                test_name = suggestions[0]
                availability_response = self.run_test(f"Check Availability - {test_name}", "GET", 
                                                    f"persona/check/{test_name}", 200)
                
                if availability_response:
                    is_available = availability_response.get('available', False)
                    print(f"   Name '{test_name}' availability: {is_available}")
                    return True
        
        return False

    def test_demo_society_functionality(self):
        """Test demo society functionality"""
        # Test demo login
        demo_response = self.run_test("Demo Society Login", "POST", "auth/demo", 200)
        
        if demo_response:
            demo_user = demo_response.get('user', {})
            print(f"   Demo user created: {demo_user.get('persona_name')}")
            print(f"   Demo society ID: {demo_user.get('society_id')}")
            
            # Test get demo society info
            demo_info_response = self.run_test("Get Demo Society Info", "GET", "societies/demo/info", 200)
            
            if demo_info_response:
                print(f"   Demo society: {demo_info_response.get('name')}")
                demo_society_id = demo_info_response.get('id')
                
                # Test demo posts (should have dummy posts)
                demo_posts_response = self.run_test("Get Demo Posts", "GET", "posts", 200, 
                                                   params={"society_id": demo_society_id, "user_id": demo_user.get('id')})
                
                if demo_posts_response:
                    dummy_posts = [p for p in demo_posts_response if p.get('is_dummy', False)]
                    print(f"   Demo society has {len(demo_posts_response)} total posts, {len(dummy_posts)} dummy posts")
                    return len(dummy_posts) > 0
        
        return False

    def test_post_filtering(self):
        """Test post type filtering functionality"""
        # First create a user and select society
        test_mobile = f"99{str(int(time.time()))[-8:]}"  # Use timestamp for unique mobile
        login_response = self.run_test("Login for Post Filter Test", "POST", "auth/login", 200, {
            "mobile_number": test_mobile
        })
        
        if not login_response:
            return False
            
        user = login_response.get('user', {})
        user_id = user.get('id')
        
        # Get societies and select first one
        societies_response = requests.get(f"{self.base_url}/societies")
        if societies_response.status_code != 200 or not societies_response.json():
            self.log_result("Post Filtering", False, "No societies available")
            return False
            
        society_id = societies_response.json()[0]['id']
        
        # Select society
        select_response = requests.put(f"{self.base_url}/users/{user_id}/society", 
                                     json={"society_id": society_id})
        
        if select_response.status_code != 200:
            self.log_result("Post Filtering", False, "Failed to select society")
            return False
        
        # Test filtering by post type
        post_types = ['discussion', 'question', 'poll']
        
        for post_type in post_types:
            filter_response = self.run_test(f"Filter Posts - {post_type}", "GET", "posts", 200, 
                                          params={
                                              "society_id": society_id, 
                                              "user_id": user_id, 
                                              "post_type": post_type
                                          })
            
            if filter_response:
                filtered_types = [p['post_type'] for p in filter_response]
                all_correct_type = all(pt == post_type for pt in filtered_types)
                if all_correct_type:
                    print(f"   ✓ {post_type} filter working - {len(filter_response)} posts")
                else:
                    print(f"   ✗ {post_type} filter not working - mixed types: {set(filtered_types)}")
        
        # Test dummy post filtering
        with_dummy = self.run_test("Posts with Dummy", "GET", "posts", 200, 
                                 params={
                                     "society_id": society_id, 
                                     "user_id": user_id, 
                                     "include_dummy": True
                                 })
        
        without_dummy = self.run_test("Posts without Dummy", "GET", "posts", 200, 
                                    params={
                                        "society_id": society_id, 
                                        "user_id": user_id, 
                                        "include_dummy": False
                                    })
        
        if with_dummy and without_dummy:
            dummy_count_with = len([p for p in with_dummy if p.get('is_dummy', False)])
            dummy_count_without = len([p for p in without_dummy if p.get('is_dummy', False)])
            
            print(f"   With dummy: {len(with_dummy)} posts ({dummy_count_with} dummy)")
            print(f"   Without dummy: {len(without_dummy)} posts ({dummy_count_without} dummy)")
            
            success = dummy_count_without == 0 and len(with_dummy) >= len(without_dummy)
            self.log_result("Dummy Post Filtering", success, 
                          f"Dummy filtering working correctly" if success else "Dummy filtering not working")
            
            return True
        
        return False

    def test_persona_update_api(self):
        """Test persona name update functionality"""
        # Create a test user first
        test_mobile = f"97{str(int(time.time()))[-8:]}"
        login_response = self.run_test("Login for Persona Update Test", "POST", "auth/login", 200, {
            "mobile_number": test_mobile
        })
        
        if not login_response:
            return False
            
        user = login_response.get('user', {})
        user_id = user.get('id')
        original_name = user.get('persona_name')
        
        # Test updating persona name
        new_name = f"TestPersona{int(time.time())}"
        update_response = self.run_test("Update Persona Name", "PUT", f"users/{user_id}/persona", 200, {
            "persona_name": new_name
        })
        
        if update_response:
            print(f"   Updated persona from '{original_name}' to '{new_name}'")
            
            # Verify the update by getting user
            verify_response = self.run_test("Verify Persona Update", "GET", f"users/{user_id}", 200)
            
            if verify_response:
                updated_name = verify_response.get('persona_name')
                success = updated_name == new_name
                self.log_result("Persona Name Updated", success, 
                              f"Name is now '{updated_name}'" if success else f"Expected '{new_name}', got '{updated_name}'")
                return success
        
        return False

    def run_all_tests(self):
        """Run all new feature tests"""
        print("🚀 Starting New Features API Tests")
        print("="*60)
        
        # Run tests in order
        test_methods = [
            self.test_new_societies_in_search,
            self.test_society_request_api,
            self.test_persona_functionality,
            self.test_demo_society_functionality,
            self.test_post_filtering,
            self.test_persona_update_api
        ]

        for test_method in test_methods:
            try:
                print(f"\n--- {test_method.__name__.replace('test_', '').replace('_', ' ').title()} ---")
                test_method()
                time.sleep(0.5)  # Small delay between tests
            except Exception as e:
                print(f"❌ {test_method.__name__} failed with exception: {str(e)}")

        print("\n" + "="*60)
        print(f"📊 New Features Test Results: {self.tests_passed}/{self.tests_run} tests passed")
        
        success_rate = (self.tests_passed / self.tests_run * 100) if self.tests_run > 0 else 0
        
        if success_rate >= 85:
            print("🎉 New features are working well!")
            return 0
        else:
            print("⚠️  Some new features need attention. Check the details above.")
            return 1

def main():
    tester = NewFeaturesAPITester()
    return tester.run_all_tests()

if __name__ == "__main__":
    sys.exit(main())