# Scribbles
<br>

## [Click here to go to the website!](https://scribbles-f4x1.onrender.com)
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
    - Who liked the user Scribbles
    - Get email conformation when user signs up
    
 - Scribble Page
    - Filter part on the search

 - Login Page
    - Login with username
 
<br>

## API routes (back-end)

- GET / 
  - renders index.hbs
- GET /signup
  - redirects to / if user logged in
  - renders auth/signup.hbs
- POST /signup
  - redirects to / if user logged in
  - body:
    - email
    - password
    - first name
    - last name
    - Profile Picture
  - redirects to /login
- GET /login
  - redirects to / if user logged in
  - renders auth/login.hbs
- POST /login
  - redirects to / if user logged in
  - body:
    - email
    - password
  - redirect to /userProfile
- GET /userProfile
  - redirects to /login if user logged out
  - renders auth/profile.hbs
- GET /userProfile/edit
  - redirects to /login if user logged out
  - renders auth/edit-profile
- POST /userProfile/edit
  - redirects to /login if user logged in
  - body:
    - email
    - password
    - first name
    - last name
    - Profile Picture
  - redirect to /userProfile
- GET /user/:userId/myscribbles
  - renders myscribbles.hbs
  - shows the posts the user has made
- POST /auth/logout
  - body: (empty)
- GET /scribbles/category
  - renders channels/category pages
  - the categories are art-fart.hbs, city-vibes.hbs, food-corner.hbs, game-hub.hbs
  - shows the posts the user has made
- GET /scribbles/create
  - redirects to /login if user logged in
  - renders auth/create-post.hbs
- POST /scribbles/create
  - body:
    - title
    - category
    - description
    - location
    - comments
  - create a new post
  - redirects to /scribbles/categoryId
- GET /scribbles/edit/:id
  - renders auth/edit-scribble.hbs
- POST /scribbles/edit/:id
  - body:
    - title
    - category
    - description
    - location
    - ImageUrl
  - edits a post
  - redirects to /scribbles/updatedScribble.category
- GET /scribbles
  - renders scribbles.hbs
- GET /scribbles/:id
  - redirects to /login if user logged in
  - renders channels/scribble.hbs
  - displays the post
- POST /scribbles/:id/comments
  - redirects to /login if user logged in
  - body:
    - content
  - posts a comment on a post
  - redirects to /scribbles/scribbleId
- GET /comments/delete/:id
  - redirects to /login if user logged in
  - deletes a comment on a post
  - redirects to /scribbles/scribbleId
- GET /scribbles/delete/:id
  - redirects to /login if user logged in
  - deletes a post
  - redirects to /scribbles/scribbleId
- GET /scribbles/:id/like
  - redirects to /login if user logged in
  - likes a post
  - redirects to /scribbles/scribbleId
- POST /scribbles/:id/like
  - redirects to /login if user logged in
  - likes a post
  - redirects to /scribbles/scribbleId
- GET /scribbles/:id/like
  - redirects to /login if user logged in
  - displays the users liked posts
  - renders auth/liked-posts.hbs

<br>

## Models

User model
 
```
first_Name: type: String,
            trim: true,
            required: true,
            unique: false

last_Name: type: String,
           trim: true,
           required: true,
           unique: false

username:  type: String,
            trim: true,
            required: true,
            unique: true

email:  type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true

email:  type: String,
        required: true
    
email:  type: String,
        required: false,
        default: '../public/images/default.jpg'

```

Scribble model

```
title:  type: String,
        trim: true,
        required: true

category:  type: String,
           trim: true,
           required: true,
           enum: ['Art Fart', 'Food Corner', 'Game Hub', 'City Vibes']

description:  type: String,
              required: true,

location:  type: String,
           required: false

time:  type: Date,
       default: Date.now,
       required: true  

ImageUrl:  type: String,
           required: false,
           default: '../public/images/default_post.png'

comments:  type: Schema.Types.ObjectId,
           ref: 'Comment'

user:  type: Schema.Types.ObjectId,
        ref: 'User',
        required: true

likes:  type: Schema.Types.ObjectId,
        ref: 'User' 

```

Comment model

```

user:  type: Schema.Types.ObjectId,
       ref: 'User',
       required: true

createdAt:  type: Date,
       default: Date.now

content:  type: String,
       required: true

scribble:  type: Schema.Types.ObjectId,
       ref: 'Scribble',
       required: true

```
<br>

## Links

## Collaborators

[Amelie Brix](https://github.com/AmelieBrix)

[Aditya Raikar](https://github.com/Addiyo22)

### Project

[Repository Link](https://github.com/AmelieBrix/scribbles)

[Deploy Link](https://scribbles-f4x1.onrender.com)

### Trello

[Link to trello board](https://trello.com/b/Sxe2ysXJ/scribbles)

### Slides

[Slides Link](www.your-slides-url-here.com)




