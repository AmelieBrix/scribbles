# Scribbles
<br>

## [Click here to go to the website!]()
<br>

# Description
Scribbles is an online blog platform where users can register, post content (referred to as "scribbles"), and share various activities and experiences. The platform features categories such as 'Art Fart', 'City Vibes', 'Food Corner', and 'Game Hub'. Users can also comment on and like posts. Additionally, users have the ability to delete and edit their own posts.
<br>

## User stories
- **404** - As a user I want to see a nice 404 page when I go to a page that doesn’t exist so that I know it was my fault.
- **500** - As a user I want to see a nice error page when the super team screws it up so that I know that is not my fault
- **login-signup** - As a user I want to see a welcome page that gives me the option to either log in as an existing user, or sign up with a new account. 
- **add-signup** - As a user I want to sign up with my full information so that I can view more information for a perticular Scribble.
- **homepage** - As a user I want to see the homepage of the website.
- **Scribbles-page** - As a user I want to see the various scribbles and add comments on them.
- **Scribble-creation-page** - As a user I want to see a Scribble creation form so I can create a post and put in my Ideas.
- **Scribble-deletion** - As a user I want to delete any scribbles I make if I dont like them
- **user-profile** - As a user I want to check my profile information and be able to edit it, and view the scribbles I made along with my liked Scribbles. Also, to go back to the home page if I don't want to see the profile anymore.
- **My-Scribbles** - As a user I want to see all the scribbles I have created.
- **My-liked-Scribbles** - As a user I want to see all the scribbles I have liked.
<br>

## Backlog

 - Chat Functionality
    - Functionality to chat with other users
    
 - User profile
    - Unsubscribe from Scribbles
    - Who favorited the my Scribbles
    - Get email conformation when user signs up
    
 - Scribble Page
    - Filter part on the search
    
<br>

## API routes (back-end)

- GET / 
  - renders index.hbs
- GET /auth/signup
  - redirects to / if user logged in
  - renders signup.hbs
- POST /auth/signup
  - redirects to / if user logged in
  - body:
    - email
    - password
    - first name
    - last name
    - Profile Picture
- POST /auth/login
  - redirects to / if user logged in
  - body:
    - email
    - password

