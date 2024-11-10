# TableCheck SWE Fullstack Take-Home Assignment

Waitlist Manager is a full-stack application designed to handle the waitlist of a restaurant. It manages seating, queueing, and notifications for the diners. The app should replace the use of the usual “pen & paper” solution that many restaurants adopt here in Japan: if the restaurant is at capacity, you enter your name and party size and wait until the waiter calls you.

So, the user flow is as follows:

- A party of diners go to their favorite restaurant. It's fully booked, but the restaurant gives the option to join a virtual waitlist. This comes in the form of a simple frontend reachable via the browser and can be implemented however you want. We recommend isomorphic SSR but you can use any pattern you wish such as SPA, islands, traditional SSR, etc.
- When the diner opens the app they're asked to input their name and party size.
- After joining the waitlist, they can check the app to verify if it's their turn.
- When the table is ready for them, they check-in via the app and get seated.

## Technical Requirements

### Frontend

Our tech stack uses ReactJS and TypeScript, but you shouldn’t be limited to that. If you feel more proficient with a different stack, just go for it!

### Backend

Similarly, while our stack uses Ruby on Rails with MongoDB, you’re free to use any mainstream language/framework and storage.

Whatever database you decide to use, it should be runnable with a simple `docker compose up`.

## Detailed Specifications

1. **Restaurant Capacity**

Hardcoded to 10 seats

2. **Service Time Calculation**

Hardcoded to 3 seconds per person. Example: A party of 4 takes 12 seconds to complete the service.

3. **Joining the waitlist**

The diner opens the app that shows:

- Input: Name
- Input: Party size
- Button: “Join Waitlist”. Action:
  - The party is added to the waitlist queue.
  - The button changes to “Leave Waitlist”.

4. **Queue management**

When a party completes service:

- The system checks the queue for the next party.
- If the seats available are enough for the next party size, the next party’s app shows a new “Check-in” button.
- If not, wait until enough seats are available.

5. **Checking in and starting the service**

- Button: “Check-in”. Action:
  - The party is removed from the waitlist queue.
  - The seats availability is increased by the party size.
  - The service countdown starts for that party size.

6. **Completing the service**

When the countdown of a service for a certain party reaches 0, the service is completed, and the restaurant’s seat availability is increased by the party size.

## Going the extra mile?

Here are a few ideas if you want to improve the service further. Otherwise, feel free to add your very own feature!

a. **Leaving the waitlist**

Show the button: “Leave Waitlist” after joining the waitlist. Action:

- The party is removed from the waitlist queue.
- The button changes back to “Join Waitlist”.

b. **Checking the status**

After joining the waitlist, a message on the app displays the current position in the queue.

c. **Notifications**

The system sends notifications to the client instances when:

- The party waiting goes in second position (only 1 party ahead of them).
- The party is next and can check in.
- 1st late notification: sent 10 seconds after the “Check-in” button has been displayed and not clicked.
- Cancellation notification: sent 20 seconds after the “Check-in” button has been displayed and not clicked. The party automatically leaves the queue.

d. **Requeue if late**

20 seconds after the “Check-in” button has been displayed and not clicked, the system automatically puts the party back into the queue.

## Implementation Guidelines

1. The app should handle multiple instances: the idea is that every instance of the client app allows a new party to join the waiting list concurrently. For example, I can open three tabs of the app I'm mimicking three parties that reached the restaurant and want to join the waitlist by adding their information (name and party size).
2. Implement proper error handling and validation.
3. Write clear, maintainable, and robust code.
4. Include unit tests for critical components.

## Submission Guidelines

1. Create a public GitHub repository for your project.
2. Include this README in your repository, with clear instructions for setting up and running the project locally.
3. Include a brief explanation of your architecture decisions in the README or a separate document.

Please grant access to your repo for these following github users

`lerio` - Valerio Donati, VPoE at TableCheck
`daniellizik` - Daniel Lizik, Engineering Manager at TableCheck
`akashgupta-tc` - Akash Gupta, Associate Engineering Manager at TableCheck

## Evaluation Criteria

Your submission will be evaluated based on:

1. Functionality: Does the application work as specified?
2. Code Quality: Is the code well-structured, readable, and maintainable? Add sufficient comments in places where you think it would help other contributors to onboard more quickly to understand your code.
3. Architecture: Are there clear separations of concerns and good design patterns used?
4. User Experience: Is the interface intuitive and responsive?
5. Testing: Are there adequate unit tests?

### Good luck!
