---
layout: post
title:  "using Craiyon & OpenAI in creating fusion restaurants"
date:   2022-11-04 08:00:00 -0500
categories: projects school
tags:
    - AI
    - prototyping
    - fun
---

In a prototype, I explored the idea of recommending items from different restaurants by taking different menu items from each restaurant to piece together a new virtual restaurant concept. For example, if we have a Korean and Japanese restaurant we can merge to form a menu of an East Asian Fusion restaurant. 

## What were my goals? 

I wanted to increase cross-restaurant ordering. I believe that users will be tempted by a new fusion restaurant, and when looking at a “virtual” fusion menu, they will inevitably pick items across two restaurants. This can be helpful in creating "virtual" restaurants to increase sales on food delivery apps, or in food court to improve cross-restaurant sales.

## How did I prototype it?

The idea is to be able to create a new restaurant concept and menu on the fly, so I believe the curation shouldn’t be done by hand, but automated through AI.

I utilized **OpenAI** to generate text and **Craiyon**, formerly DALL-E mini to generate images. Here’s the process of how I used them to create two virtual restaurant:
1. Choose two of the current restaurants
2. Generate a new restaurant name using OpenAI
3. Take the descriptions of the two restaurants, and ask OpenAI to generate a fusion one
4. Use Craiyon to generate a logo for the new virtual restaurant

## The birth of Chuno, a Japanese Peruvian Restaurant
![Chuno](/assets/images/chuno-text.png)
![Chuno Logo](/assets/images/chuno-logo.png)

I did the same for a Korean-American fusion called** Tofu House**, and put them side by side with 4 other real restaurants on a selection menu.

![Restaurant options](/assets/images/restaurant-options.png)

## Trying them out with real users

I decided to provide the users with the menus, and ask them to make choices as if they were actually at the food court w/o providing them knowledge about there being virtual restaurants. I wanted to learn if they will notice anything is off / weird about the virtual restaurants and at the same time see if there’s any interest in the virtual restaurants.
I spoke with a total of 4 users, and here's what I did

1. I explained to them the context of the activity, that they are at a food court that has multiple restaurants, and there was a tablet at the entrance that allowed them to browse the restaurants and the menus. 
2. I ask them to look through the list of restaurants (the first prototype), and ask them to go through the restaurants one by one, and from there pick the following:
- Which restaurant are you most interested in / would like to get your food from?
- Are there any restaurants that you definitely won’t go to?


## Here's what I learnt

All participants did not pick up that there was anything weird about the virtual restaurants, in fact two of them would prefer to visit the virtual fusion restaurant instead of the other restaurants in the food court.

> Chuno, seems the most interesting because it's the most novel. If I'm not wrong, the former president of Peru is Japanese. 

> (Chuno) sounds like an eclectic mix, sounds like an interesting fusion that I have never had before.


As such, virtual fusion restaurant name, descriptions, logos created using OpenAi and Craiyon were not distinguishable from the real ones. In fact, virtual fusion restaurant **actually provides an added advantage over the real restaurant** because of **the novelty aspect of the fusion**


All things considered, this had been a fun experiment to have conducted, and it allowed me to experiment with what's possible with OpenAI and Crayon in prototyping new possibilities.