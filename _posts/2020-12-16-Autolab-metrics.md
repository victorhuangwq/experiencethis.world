---
layout: post
title:  "Autolab Metrics - helping instructors identify at risk students for early intervention"
date:   2020-12-16 08:00:00 -0500
categories: projects
tags:
    - Autolab
    - user research
    - prototype
    - design
    - education
hidden: false
---

Traditional approaches of identifying students who are struggling with class is **reactive**; course staff wait for students to come to them to provide help, which can often be too late. A **proactive** approach, where course staff can monitor student progress to identify struggling students would be much more beneficial.

In the Fall of 2020, I led the development of the [Autolab Project's](https://autolabproject.com/) new [metrics feature](https://docs.autolabproject.com/features/metrics/) with 6 team members.

## Goal
Effectively help instructors identify students who might be struggling in class

To achieve that, we would need to:
- Proactively track metrics that might signify risk
- Provides **sufficient and relevant information** for instructors to determine if a student is high-risk
- Requires **little maintenance** on the instructors’ part, notifying only when they need to act

## Risk Metrics
Our team conducted user interviews with 6 professors at Carnegie Mellon, we have ascertain that an initial set of conditions that could help identify potential at-risk students.

| Risk Conditions | Potentially Identifies |
| --- | -- |
| Students who have used *X number* grace (late submission) days by *date* | Poor time / workload management |
| Students whose grades have dropped by *X number* percent within *Y number* consecutive assignments | Gradual slipping of grades |
| Students who did not submit *X number* assignments | Skipping work |
| Students with *X number* submitted assignments below a percentage of *Y number* | Generally weaker students |

## Prototype Iterations 

Together with my team, we iterated on prototypes. Our first idea was that given a set of conditions, a running list of students would be generated. Instructors will return to this page to manage student's progression.

![Prototype Sketch 1](/assets/images/prototype-sketch-1.png){: width="400" }

From internal discussions, we realize that it is much more valuable for instructors to not need to actively manage and curate the list. So we decided to have a watchlist that notifies them like an email inbox.

![Prototype 2](/assets/images/prototype-2.png)

User testing helped us figure out that batch actions are important, and we also then fixed other copywriting issues

![Prototype 3](/assets/images/prototype-3.png)

With a satisfactory prototype, we proceeded to implement the feature into our application.

## Metrics Feature

![Student Metrics](/assets/images/student_metrics.png)

Instructors will set up their course as per usual, and then they will set up their **Student Metrics**. 

![Watchlist](/assets/images/watchlist.png)

Instructors are then able to refresh and keep track of students in need of attention in the **Watchlist**. They are then able to use it as a work list to keep track of whether a student has been contacted and resolved. Each row of student also has sufficient information to help instructors determine the reason the student is deemed as needing attention.

**Update**: As of Fall 2021, it has been successfully deployed onto CMU's production Autolab, and we have been getting instructors to use the feature.