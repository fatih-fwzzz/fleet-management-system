# MBTA Fleet Tracker

## How to Run

- Install dependencies by running `npm install`
- Generate the native Android and iOS projects by running `npx expo prebuild`
- Run on Android by running `npx expo run:android`
- Run on iOS by running `npx expo run:ios`

## Architecture

### Component-Based Architecture

The UI is made of small, re-usable components that do one thing. Therefore, the vehicle card, filter chips & the loading skeleton as well as error message and empty state are all isolated components. These components are all put together on one page and this is what makes up the dashboard screen. This allows you to change or replace any piece of the UI and nothing else will be touched.

### Global State with Zustand

User preferences like selected route filters and direction are stored in a Zustand global store. Any component in the app can read or update this state. When the user taps a filter chip, the store updates, and every component that depends on those filters automatically reacts to the change. This avoids passing filter data through many layers of components.

### Server State and Client State Separation

The app separates two kinds of state:

- **Server state** is data that comes from the MBTA API, like vehicle positions, routes, and stops. This is managed by TanStack Query, which handles fetching, caching, automatic background polling, pagination, and retry on error. The app never manually stores API data — TanStack Query owns it entirely.
- **Client state** is data that only exists on the device, like which filters the user has selected. This is managed by Zustand. It never touches the API directly.

These two systems are connected through the query key. The Zustand filter values are included in the TanStack Query key, so when the user changes a filter, TanStack Query sees a new key and automatically re-fetches with the updated parameters.

### Adapter/Transformer Pattern in the API Layer

A data format called JSON API that allows for technical data follows this pattern where related objects, such as stops, and routes and trips are stored separately from one another but have their IDs pointed toward those objects. You use an adapter layer that lives between the API and the rest of the app This takes the raw response and converts it into basic flat objects that can be consumed by the UI. For example, instead of the UI having to know that stop id "1221" maps to "Columbus Ave @ Cedar St", the adapter resolves that automatically internally. It does things like translating "STOPPED_AT" into human-readable text, such as the location of a stop (example, "Stopped at Columbus Ave @ Cedar St"), and converts timestamps to relative time intervals like ("2 min ago"). The raw API format is not visible to the rest of the app.
