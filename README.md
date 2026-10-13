# Vue EasyMart

A Vue 3 e-commerce storefront for EasyMart, built with Vite, Pinia, and Vue Router. This project replicates an original SCSS/JS EasyMart interface using Vue components and plain CSS.

## Features

- Responsive layout (desktop, tablet, and mobile)
- Category selector with horizontal scroll and emoji icons
- Product filtering by price, discount, and rating (client-side)
- Product carousel with navigation controls and responsive card counts
- Search with live dropdown results (debounced API calls)
- Sticky header with mobile sidebar navigation
- Footer with navigation sections

## Tech Stack

- [Vue 3](https://vuejs.org/) (Composition API with `<script setup>`)
- [Vite](https://vite.dev/)
- [Vue Router](https://router.vuejs.org/)
- [Pinia](https://pinia.vuejs.org/)
- Plain CSS (no Sass/SCSS)

## API

Data is fetched from [DummyAPI Codesmash](https://dummyapi.codesmash.in/):

| Endpoint | Purpose |
|---|---|
| `/api/products/categories` | Fetch product categories |
| `/api/products/category/{slug}` | Fetch products for a category |
| `/api/products/search` | Search products |
| `/api/users/1` | Fetch user profile for sidebar |

## Project Structure

```text
src/
├── App.vue
├── components/
├── img/
├── fonts/
├── router/
├── script/
├── stores/
├── style/
└── template/
    ├── appHeader.vue
    ├── appSearch.vue
    ├── appSideBar.vue
    ├── sidebar/
    │   └── sideBarFilter.vue
    ├── appCategorySelector.vue
    ├── appHero.vue
    ├── appProductSection.vue
    └── appFooter.vue
```

## Getting Started

### Prerequisites

- Node.js 22.18+ or >= 24.12
- npm 9+

### Installation

```sh
npm install
```

### Development

```sh
npm run dev
```

### Build

```sh
npm run build
```

### Preview

```sh
npm run preview
```

### Lint and Format

```sh
npm run lint
```

```sh
npm run format
```

## Design Notes

- Breakpoints: tablet-lg 1080px, tablet-md 991px, mobile-lg 767px, mobile-md 576px, mobile-sm 540px
- Font family: Inter (woff2 fonts included)
- Filtering is client-side; changing filters does not trigger new API requests

## License

Private project.
