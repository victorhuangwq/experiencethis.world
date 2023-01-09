---
layout: post
title:  "Improving Reddit communities through engagement"
date:   2022-12-11 08:00:00 -0500
categories: projects school
tags:
    - AI
    - prototyping
    - reddit
    - fun
---

Reddit can be a toxic place, sadly. According to this [New Scientist](https://www.newscientist.com/article/2334043-more-than-one-in-eight-reddit-users-publish-toxic-posts/#:~:text=More%20than%20one%20in%20eight%20Reddit%20users%20publish%20toxic%20content,the%20social%20news%20aggregation%20platform.) article
> More than one in eight Reddit users publish toxic posts. An analysis of 1.2 million Reddit users found that around 16 per cent of people wrote toxic posts and 13 per cent wrote toxic comments, such as direct insults

I worked with Kimi Wenzel, Michelle Liu and Sunny Liang, we are explore what we can do to educate users who are not familiar with such innocuous toxic acts (and also overt acts) in Reddit communities and encourage them to engage with the actors in the betterment of online communities. 

## Our brainstorming

We also narrowed down to using a Chrome extension, and that it is targeted towards users who want to be informed in their day to day usage of reddit. 

Through exploration with Michelle Liu, we realized it’s possible to interactively inject a very convincing Reddit comment reply, and if we could somehow display one when the user interacts with our prototype, it will simulate the real consequences to the subjects. **We could get users to log into their reddit accounts, and make them feel as if they are actually interacting with the page from their own account.** As such, we can be more confident that our research results will reflect accurately as to whether users will partake in the suggested actions provided. 

We are prototyping it over one singular reddit thread.  It provides an explanation as to why the comment is offending, and provide suggested actions to them

## Our prototype

Here's our [**GitHub Repository**](https://github.com/victorhuangwq/community-improver). The extension is usable and works on this reddit [link](https://www.google.com/url?q=https://www.reddit.com/r/cmu/comments/yv2qwk/does_faang_career_help_with_csml_admission/&sa=D&source=docs&ust=1673246292446554&usg=AOvVaw24Msd3_nyPtEc_x5SXMWC2). It can also be modified to be used for further experimentation.

Here's an example of how it looks like:

![Community Bot](/assets/images/community-bot.png)

Particularly, I was in charge of generating a mock comment upon the user's interaction with our prototype.
## Usability Testing

### What did we want to learn?
- Which method is more effective for encouraging users to help moderate / inform other people in the community (predefined replies by the user v. anonymous bot)?
- How effective is our tool in encouraging users to moderate / inform other community members for (hostile sexism v. benevolent sexism)?

### How did we go about doing it?
We presented the prototype as if it’s fully functional, as such we asked the users to log into their reddit accounts before proceeding with the user testing. We also mocked the sexist comment that they are seeing, so that we can control for all the other variables.  Therefore, if they were to click on the prompts, a mock reply will be generated with their usernames and profile picture (or a bot, depending on the test conditions). 

They do not know that the interactions with the site are mocked up, during the user testing. At the end of the user testing, we let the user know that the offending comment and the reply was actually mocked. This would allow us to obtain realistic feedback during the usability testing, while ensuring that they do not walk away believing that the environment was real.

We tested 4 different conditions in total. **(Hostile, Innocuous) X (User Reply, Bot Reply)**, with 3 subjects for each condition

## Our takeaways

- **Anonymity is a big concern for reddit users**  
User do not want to post from their own accounts as they don't want to be involved in online arguments, or draw attention to themselves. They are thus more willing to respond by summoning a bot account, instead of replying from their own account.
- **Suggested 1-click replies of our extension was appreciated**  
Having canned replies lowered the barrier to act on the issue.
- **Different modes of delivery should be explored**  
Using DMs, instead of comments, can reduce the "public shaming" aspect and trigger less defensiveness. 