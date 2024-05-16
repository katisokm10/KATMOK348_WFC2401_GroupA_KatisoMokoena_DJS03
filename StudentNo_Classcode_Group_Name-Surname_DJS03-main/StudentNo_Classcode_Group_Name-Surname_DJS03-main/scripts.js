

import { books, authors, genres, BOOKS_PER_PAGE } from './data.js';

let page = 1;
let matches = books;

// Function to create a book preview element
function createBookPreviewElement({ id, image, title, author }) {
    const element = document.createElement('button');
    element.classList = 'preview';
    element.setAttribute('data-preview', id);

    element.innerHTML = `
        <img
            class="preview__image"
            src="${image}"
        />
        
        <div class="preview__info">
            <h3 class="preview__title">${title}</h3>
            <div class="preview__author">${authors[author]}</div>
        </div>
    `;

    return element;
}

// Function to render book previews
function renderBookPreviews() {
    const fragment = document.createDocumentFragment();
    const booksToShow = matches.slice(0, BOOKS_PER_PAGE);

    for (const book of booksToShow) {
        const previewElement = createBookPreviewElement(book);
        fragment.appendChild(previewElement);
    }

    document.querySelector('[data-list-items]').appendChild(fragment);
}

// Function to render genre options
function renderGenreOptions() {
    const genreHtml = document.createDocumentFragment();
    const firstGenreElement = document.createElement('option');
    firstGenreElement.value = 'any';
    firstGenreElement.innerText = 'All Genres';
    genreHtml.appendChild(firstGenreElement);

    for (const [id, name] of Object.entries(genres)) {
        const element = document.createElement('option');
        element.value = id;
        element.innerText = name;
        genreHtml.appendChild(element);
    }

    document.querySelector('[data-search-genres]').appendChild(genreHtml);
}

// Function to render author options
function renderAuthorOptions() {
    const authorsHtml = document.createDocumentFragment();
    const firstAuthorElement = document.createElement('option');
    firstAuthorElement.value = 'any';
    firstAuthorElement.innerText = 'All Authors';
    authorsHtml.appendChild(firstAuthorElement);

    for (const [id, name] of Object.entries(authors)) {
        const element = document.createElement('option');
        element.value = id;
        element.innerText = name;
        authorsHtml.appendChild(element);
    }

    document.querySelector('[data-search-authors]').appendChild(authorsHtml);
}

// Function to handle theme preference
function handleThemePreference() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.querySelector('[data-settings-theme]').value = 'night';
        document.documentElement.style.setProperty('--color-dark', '255, 255, 255');
        document.documentElement.style.setProperty('--color-light', '10, 10, 20');
    } else {
        document.querySelector('[data-settings-theme]').value = 'day';
        document.documentElement.style.setProperty('--color-dark', '10, 10, 20');
        document.documentElement.style.setProperty('--color-light', '255, 255, 255');
    }
}

// Function to update "Show more" button text and disabled state
function updateShowMoreButton() {
    const remainingBooks = Math.max(0, matches.length - (page * BOOKS_PER_PAGE));
    const buttonText = `Show more (${remainingBooks})`;
    const buttonDisabled = remainingBooks <= 0;

    document.querySelector('[data-list-button]').innerText = buttonText;
    document.querySelector('[data-list-button]').disabled = buttonDisabled;
}

// Event listeners setup
function setupEventListeners() {
    // Add event listeners for cancel buttons
    document.querySelector('[data-search-cancel]').addEventListener('click', () => {
        document.querySelector('[data-search-overlay]').open = false;
    });

    document.querySelector('[data-settings-cancel]').addEventListener('click', () => {
        document.querySelector('[data-settings-overlay]').open = false;
    });

    // Event listener for opening search overlay
    document.querySelector('[data-header-search]').addEventListener('click', () => {
        document.querySelector('[data-search-overlay]').open = true;
        document.querySelector('[data-search-title]').focus();
    });

    // Event listener for opening settings overlay
    document.querySelector('[data-header-settings]').addEventListener('click', () => {
        document.querySelector('[data-settings-overlay]').open = true;
    });

    // Event listener for closing active list
    document.querySelector('[data-list-close]').addEventListener('click', () => {
        document.querySelector('[data-list-active]').open = false;
    });

    // Event listener for handling theme settings
    document.querySelector('[data-settings-form]').addEventListener('submit', (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        const { theme } = Object.fromEntries(formData);

        if (theme === 'night') {
            document.documentElement.style.setProperty('--color-dark', '255, 255, 255');
            document.documentElement.style.setProperty('--color-light', '10, 10, 20');
        } else {
            document.documentElement.style.setProperty('--color-dark', '10, 10, 20');
            document.documentElement.style.setProperty('--color-light', '255, 255, 255');
        }

        document.querySelector('[data-settings-overlay]').open = false;
    });

    // Event listener for submitting search form
    document.querySelector('[data-search-form]').addEventListener('submit', (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        const filters = Object.fromEntries(formData);
        const result = [];

        for (const book of books) {
            let genreMatch = filters.genre === 'any';

            for (const singleGenre of book.genres) {
                if (genreMatch) break;
                if (singleGenre === filters.genre) { genreMatch = true; }
            }

            if (
                (filters.title.trim() === '' || book.title.toLowerCase().includes(filters.title.toLowerCase())) &&
                (filters.author === 'any' || book.author === filters.author) &&
                genreMatch
            ) {
                result.push(book);
            }
        }
        page = 1;
        matches = result;

        // Show or hide message based on search result
        if (result.length < 1) {
            document.querySelector('[data-list-message]').classList.add('list__message_show');
        } else {
            document.querySelector('[data-list-message]').classList.remove('list__message_show');
        }

        // Clear existing items and render new ones
        document.querySelector('[data-list-items]').innerHTML = '';
        renderBookPreviews();

        // Update "Show more" button
        updateShowMoreButton();

        // Scroll to top and close search overlay
        window.scrollTo({ top: 0, behavior: 'smooth' });
        document.querySelector('[data-search-overlay]').open = false;
    });

    // Event listener for "Show more" button
    document.querySelector('[data-list-button]').addEventListener('click', () => {
        const fragment = document.createDocumentFragment();
        const startIndex = page * BOOKS_PER_PAGE;
        const endIndex = (page + 1) * BOOKS_PER_PAGE;

        // Append new previews to the fragment
        for (const { author, id, image, title } of matches.slice(startIndex, endIndex)) {
            const element = document.createElement('button');
            element.classList = 'preview';
            element.setAttribute('data-preview', id);

            element.innerHTML = `
                <img class="preview__image" src="${image}" />
                <div class="preview__info">
                    <h3 class="preview__title">${title}</h3>
                    <div class="preview__author">${authors[author]}</div>
                </div>
            `;

            fragment.appendChild(element);
        }

        // Append fragment to list items and increment page
        document.querySelector('[data-list-items]').appendChild(fragment);
        page += 1;

        // Update "Show more" button
        updateShowMoreButton();
    });

    // Event listener for preview click
    document.querySelector('[data-list-items]').addEventListener('click', (event) => {
        const pathArray = Array.from(event.path || event.composedPath());
        let active = null;

        for (const node of pathArray) {
            if (active) break;

            if (node?.dataset?.preview) {
                let result = null;

                for (const singleBook of books) {
                    if (result) break;
                    if (singleBook.id === node?.dataset?.preview) result = singleBook;
                }

                active = result;
            }
        }

        if (active) {
            document.querySelector('[data-list-active]').open = true
            document.querySelector('[data-list-blur]').src = active.image
            document.querySelector('[data-list-image]').src = active.image
            document.querySelector('[data-list-title]').innerText = active.title
            document.querySelector('[data-list-subtitle]').innerText = `${authors[active.author]} (${new Date(active.published).getFullYear()})`
            document.querySelector('[data-list-description]').innerText = active.description
        }

        
    });
}


// Initialization function
function initialize() {
    renderBookPreviews();
    renderGenreOptions();
    renderAuthorOptions();
    handleThemePreference();
    updateShowMoreButton();
    setupEventListeners();
}

// Call initialize function to start the application
initialize();

