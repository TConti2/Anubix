# Anubix MVP QA Checklist

## Core Navigation
- [ ] /dashboard loads
- [ ] /activity loads
- [ ] /athletes loads
- [ ] /classes loads
- [ ] /enrollments loads
- [ ] /attendance loads
- [ ] /skills loads
- [ ] /payments loads
- [ ] /my-progress loads
- [ ] /settings loads

## Role Protection
- [ ] parent cannot access /athletes
- [ ] parent cannot access /classes
- [ ] parent cannot access /enrollments
- [ ] parent cannot access /attendance
- [ ] parent cannot access /skills
- [ ] parent cannot access /activity
- [ ] parent cannot access /payments
- [ ] parent cannot access /settings
- [ ] admin can access all admin pages

## Core Actions
- [ ] add athlete
- [ ] edit athlete
- [ ] delete athlete
- [ ] add class
- [ ] edit class
- [ ] delete class
- [ ] enroll athlete
- [ ] prevent duplicate enrollment
- [ ] prevent over-capacity enrollment
- [ ] remove enrollment
- [ ] mark attendance
- [ ] edit attendance
- [ ] delete attendance
- [ ] update skill progress
- [ ] add coach notes
- [ ] edit tuition
- [ ] edit balance

## Dashboard
- [ ] active students count is correct
- [ ] class count is correct
- [ ] enrollment count is correct
- [ ] monthly tuition total is correct
- [ ] outstanding balance total is correct
- [ ] attendance rate displays correctly
- [ ] recent activity shows latest actions

## Parent Portal
- [ ] parent sees limited sidebar
- [ ] parent dashboard shows portal card
- [ ] /my-progress shows linked athlete
- [ ] tuition and balance display
- [ ] skill progress displays privately