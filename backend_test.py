#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime
import random
import time

class SocietySocialsAPITester:
    def __init__(self, base_url="https://neighborhood-buzz.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.user_id = None
        self.society_id = None
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

    def test_root_endpoint(self):
        """Test API root endpoint"""
        response = self.run_test("API Root", "GET", "", 200)
        return response is not None

    def test_user_login(self):
        """Test user login with mobile number"""
        test_mobile = f"98{random.randint(10000000, 99999999)}"  # Generate random 10-digit mobile
        
        # Test invalid mobile first
        self.run_test("Login - Invalid Mobile", "POST", "auth/login", 400, {
            "mobile_number": "123"  # Invalid mobile
        })
        
        # Test valid mobile (new user)
        response = self.run_test("Login - New User", "POST", "auth/login", 200, {
            "mobile_number": test_mobile
        })
        
        if response:
            self.user_id = response.get('user', {}).get('id')
            is_new = response.get('is_new', False)
            if self.user_id and is_new:
                print(f"   Created new user: {self.user_id}")
                
                # Test login again (existing user)
                response2 = self.run_test("Login - Existing User", "POST", "auth/login", 200, {
                    "mobile_number": test_mobile
                })
                
                if response2 and not response2.get('is_new', True):
                    print(f"   Existing user login successful")
                    return True
        
        return self.user_id is not None

    def test_get_user(self):
        """Test get user endpoint"""
        if not self.user_id:
            self.log_result("Get User", False, "No user ID available")
            return False
            
        response = self.run_test("Get User", "GET", f"users/{self.user_id}", 200)
        return response is not None

    def test_societies(self):
        """Test societies endpoints"""
        # Test get all societies
        response = self.run_test("Get All Societies", "GET", "societies", 200)
        
        if response and len(response) >= 10:
            self.society_id = response[0]['id']  # Use first society for testing
            print(f"   Found {len(response)} societies, using: {response[0]['name']}")
            
            # Test society search
            search_response = self.run_test("Search Societies", "GET", "societies", 200, 
                                          params={"search": "Sobha"})
            
            return search_response is not None
        else:
            self.log_result("Get All Societies", False, "Less than 10 societies found")
            return False

    def test_select_society(self):
        """Test society selection"""
        if not self.user_id or not self.society_id:
            self.log_result("Select Society", False, "Missing user_id or society_id")
            return False
            
        response = self.run_test("Select Society", "PUT", f"users/{self.user_id}/society", 200, {
            "society_id": self.society_id
        })
        
        if response:
            print(f"   Selected society: {response.get('society', {}).get('name', 'Unknown')}")
            return True
        return False

    def test_posts_crud(self):
        """Test posts CRUD operations"""
        if not self.user_id or not self.society_id:
            self.log_result("Posts CRUD", False, "Missing user_id or society_id")
            return False

        # Create Discussion Post
        discussion_data = {
            "post_type": "discussion",
            "title": "Test Discussion Post",
            "body": "This is a test discussion for automated testing."
        }
        
        discussion_response = self.run_test("Create Discussion Post", "POST", "posts", 200, 
                                          discussion_data, {"user_id": self.user_id})
        
        discussion_id = None
        if discussion_response:
            discussion_id = discussion_response.get('id')
            print(f"   Created discussion post: {discussion_id}")

        # Create Question Post
        question_data = {
            "post_type": "question",
            "title": "Test Question Post",
            "body": "This is a test question for automated testing?"
        }
        
        question_response = self.run_test("Create Question Post", "POST", "posts", 200, 
                                        question_data, {"user_id": self.user_id})
        
        question_id = None
        if question_response:
            question_id = question_response.get('id')
            print(f"   Created question post: {question_id}")

        # Create Poll Post
        poll_data = {
            "post_type": "poll",
            "title": "Test Poll Post",
            "poll_options": ["Option A", "Option B", "Option C"],
            "poll_visibility": "realtime"
        }
        
        poll_response = self.run_test("Create Poll Post", "POST", "posts", 200, 
                                    poll_data, {"user_id": self.user_id})
        
        poll_id = None
        if poll_response:
            poll_id = poll_response.get('id')
            print(f"   Created poll post: {poll_id}")

        # Test invalid post (missing title)
        self.run_test("Create Post - Invalid", "POST", "posts", 400, {
            "post_type": "discussion",
            "body": "No title provided"
        }, {"user_id": self.user_id})

        # Get all posts
        posts_response = self.run_test("Get Posts", "GET", "posts", 200, 
                                     params={"society_id": self.society_id, "user_id": self.user_id})
        
        if posts_response:
            print(f"   Retrieved {len(posts_response)} posts")

        # Test sorting
        popular_response = self.run_test("Get Posts - Popular Sort", "GET", "posts", 200, 
                                       params={"society_id": self.society_id, "user_id": self.user_id, "sort": "popular"})

        # Get individual post
        if discussion_id:
            single_post = self.run_test("Get Single Post", "GET", f"posts/{discussion_id}", 200, 
                                      params={"user_id": self.user_id})

        return (discussion_response is not None and 
                question_response is not None and 
                poll_response is not None and 
                posts_response is not None)

    def test_reactions(self):
        """Test post reactions"""
        if not self.user_id:
            self.log_result("Reactions", False, "Missing user_id")
            return False

        # First get a post to react to
        posts_response = requests.get(f"{self.base_url}/posts", 
                                    params={"society_id": self.society_id, "user_id": self.user_id})
        
        if posts_response.status_code != 200 or not posts_response.json():
            self.log_result("Reactions", False, "No posts available to react to")
            return False

        post_id = posts_response.json()[0]['id']

        # Test adding reactions
        reactions = ['agree', 'interesting', 'me_too']
        for reaction in reactions:
            response = self.run_test(f"Add Reaction - {reaction}", "POST", f"posts/{post_id}/reactions", 200, 
                                   {"reaction_type": reaction}, {"user_id": self.user_id})
            
            if not response:
                return False

        # Test removing reaction (clicking same reaction again)
        response = self.run_test("Remove Reaction", "POST", f"posts/{post_id}/reactions", 200, 
                               {"reaction_type": "agree"}, {"user_id": self.user_id})

        return response is not None

    def test_comments(self):
        """Test comment functionality"""
        if not self.user_id:
            self.log_result("Comments", False, "Missing user_id")
            return False

        # Get a post to comment on
        posts_response = requests.get(f"{self.base_url}/posts", 
                                    params={"society_id": self.society_id, "user_id": self.user_id})
        
        if posts_response.status_code != 200 or not posts_response.json():
            self.log_result("Comments", False, "No posts available to comment on")
            return False

        post_id = posts_response.json()[0]['id']

        # Create comment
        comment_data = {"body": "This is a test comment for automated testing."}
        comment_response = self.run_test("Create Comment", "POST", f"posts/{post_id}/comments", 200, 
                                       comment_data, {"user_id": self.user_id})
        
        if comment_response:
            print(f"   Created comment: {comment_response.get('id')}")

        # Get comments
        comments_response = self.run_test("Get Comments", "GET", f"posts/{post_id}/comments", 200)
        
        if comments_response:
            print(f"   Retrieved {len(comments_response)} comments")

        # Test invalid comment (too long)
        long_comment = {"body": "x" * 501}  # Over 500 character limit
        self.run_test("Create Comment - Too Long", "POST", f"posts/{post_id}/comments", 400, 
                    long_comment, {"user_id": self.user_id})

        return comment_response is not None and comments_response is not None

    def test_voting(self):
        """Test poll voting functionality"""
        if not self.user_id:
            self.log_result("Voting", False, "Missing user_id")
            return False

        # Find a poll to vote on
        posts_response = requests.get(f"{self.base_url}/posts", 
                                    params={"society_id": self.society_id, "user_id": self.user_id})
        
        if posts_response.status_code != 200:
            self.log_result("Voting", False, "Cannot retrieve posts")
            return False

        polls = [p for p in posts_response.json() if p['post_type'] == 'poll' and p.get('poll_options')]
        
        if not polls:
            self.log_result("Voting", False, "No polls available to vote on")
            return False

        poll = polls[0]
        post_id = poll['id']
        option_id = poll['poll_options'][0]['id']

        # Vote on poll
        vote_response = self.run_test("Vote on Poll", "POST", f"posts/{post_id}/votes", 200, 
                                    {"option_id": option_id}, {"user_id": self.user_id})

        # Try to vote again (should fail)
        self.run_test("Vote Again - Should Fail", "POST", f"posts/{post_id}/votes", 400, 
                    {"option_id": option_id}, {"user_id": self.user_id})

        # Test close poll (if user is author)
        if poll.get('author_id') == self.user_id:
            close_response = self.run_test("Close Poll", "POST", f"posts/{post_id}/close-poll", 200, 
                                         None, {"user_id": self.user_id})

        return vote_response is not None

    def test_reports(self):
        """Test reporting functionality"""
        if not self.user_id:
            self.log_result("Reports", False, "Missing user_id")
            return False

        # Get a post to report
        posts_response = requests.get(f"{self.base_url}/posts", 
                                    params={"society_id": self.society_id, "user_id": self.user_id})
        
        if posts_response.status_code != 200 or not posts_response.json():
            self.log_result("Reports", False, "No posts available to report")
            return False

        post_id = posts_response.json()[0]['id']

        # Report post
        report_data = {
            "target_type": "post",
            "target_id": post_id,
            "reason": "spam"
        }
        
        report_response = self.run_test("Report Post", "POST", "reports", 200, 
                                      report_data, {"user_id": self.user_id})

        # Try to report again (should fail)
        self.run_test("Report Again - Should Fail", "POST", "reports", 400, 
                    report_data, {"user_id": self.user_id})

        return report_response is not None

    def test_user_posts_history(self):
        """Test user posts history"""
        if not self.user_id:
            self.log_result("User Posts History", False, "Missing user_id")
            return False

        response = self.run_test("Get User Posts", "GET", f"users/{self.user_id}/posts", 200)
        
        if response:
            print(f"   User has {len(response)} posts")
            
        return response is not None

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting SocietySocials API Tests")
        print("="*50)
        
        # Run tests in order
        test_methods = [
            self.test_root_endpoint,
            self.test_user_login,
            self.test_get_user,
            self.test_societies,
            self.test_select_society,
            self.test_posts_crud,
            self.test_reactions,
            self.test_comments,
            self.test_voting,
            self.test_reports,
            self.test_user_posts_history
        ]

        for test_method in test_methods:
            try:
                test_method()
                time.sleep(0.5)  # Small delay between tests
            except Exception as e:
                print(f"❌ {test_method.__name__} failed with exception: {str(e)}")

        print("\n" + "="*50)
        print(f"📊 Test Results: {self.tests_passed}/{self.tests_run} tests passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return 0
        else:
            print("⚠️  Some tests failed. Check the details above.")
            return 1

def main():
    tester = SocietySocialsAPITester()
    return tester.run_all_tests()

if __name__ == "__main__":
    sys.exit(main())