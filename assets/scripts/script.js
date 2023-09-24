const books = [];
const RENDER_EVENT = 'render-book';
const STORAGE_KEY = 'saved-book';
const checkButton = document.getElementById('has-been-readed');
const searchButton = document.getElementById('search-book');

function generateBook(id, title, author, year, isComplete) {
    return {
        id,
        title,
        author,
        year,
        isComplete
    }
}

function generateId() {
    return +new Date();
}

function findBookIndex(bookId) {
    for (const index in books) {
        if(books[index].id === bookId){
            return index;
        }
    }
    return -1;
}

function findBookId(bookId) {
    for (const bookItem of books) {
        if(bookItem.id === bookId){
            return bookItem;
        }
    }
    return null;
}

function findBookTitle(bookTitle) {
    let searchedBooks = [];
    for (const bookItem of books) {
        if(bookItem.title.toUpperCase().includes(bookTitle.toUpperCase())){
            searchedBooks.push(bookItem);
        }
    }
    return searchedBooks;
}

function searchBooks(bookTitle) {
    const target = findBookTitle(bookTitle);

    if(target == null) return;

    const uncompletedBook = document.getElementById('uncompleted-book');
    uncompletedBook.innerHTML = '';

    const completedBook = document.getElementById('completed-book');
    completedBook.innerHTML = '';

    for (const bookItem of target) {
        const bookElement = makeBook(bookItem);
        if(bookItem.isComplete){
            completedBook.append(bookElement);
        } else{
            uncompletedBook.append(bookElement);
        }
    }
}

function addBookToCompleted(bookId) {
    const target = findBookId(bookId);

    if(target == null) return;

    target.isComplete = true;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveBookToStorage();
}

function undoBookFromCompleted(bookId) {
    const target = findBookId(bookId);

    if(target == null) return;

    target.isComplete = false;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveBookToStorage();
}

function removeBook(bookId) {
    const bookIndex = findBookIndex(bookId);

    if(bookIndex == -1) return;

    let confirmMessage = Swal.fire({
        icon: 'warning',
        text: 'Anda yakin ingin menghapus buku?',
        showDenyButton: true,
        denyButtonText: 'Tidak',
        confirmButtonText: 'Ya',
    }).then(result => {
        if(result.isConfirmed){
            Swal.fire('Buku berhasil dihapus', '', 'success');
            books.splice(bookIndex, 1);
            document.dispatchEvent(new Event(RENDER_EVENT));
            saveBookToStorage();
        } else if(result.isDenied){
            Swal.fire('Buku tidak dihapus', '', 'error');
        }
    })
    
}

function addBooks() {
    const bookTitle = document.getElementById('title').value;
    const bookWriter = document.getElementById('writer').value;
    const bookYear = document.getElementById('year').value;
    const bookIsCompleted = document.getElementById('has-been-readed').checked;

    const getID = generateId();
    const bookObject = generateBook(getID, bookTitle, bookWriter, bookYear, bookIsCompleted);
    
    books.push(bookObject);

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveBookToStorage();
    document.getElementById('title').innerHTML = '';
    document.getElementById('writer').innerHTML = '';
    document.getElementById('year').innerHTML = '';
    document.getElementById('has-been-readed').innerHTML = '';
}

function makeBook(bookObject) {
    const textTitle = document.createElement('h3');
    textTitle.innerText = bookObject.title;

    const textWriter = document.createElement('p');
    textWriter.innerText = 'Penulis : ' + bookObject.author;

    const textYear = document.createElement('p');
    textYear.innerText = 'Tahun : ' + bookObject.year;

    const container = document.createElement('div');
    container.classList.add('item');
    container.append(textTitle, textWriter, textYear);
    container.setAttribute('id', `book-${bookObject.id}`);

    if(bookObject.isComplete){
        const completeButton = document.createElement('button');
        completeButton.classList.add('btn-complete');
        completeButton.innerText = 'Belum selesai dibaca';

        completeButton.addEventListener('click', function () {
            undoBookFromCompleted(bookObject.id);
        });

        const removeButton = document.createElement('button');
        removeButton.classList.add('btn-remove');
        removeButton.innerText = 'Hapus buku';

        removeButton.addEventListener('click', function () {
            removeBook(bookObject.id);
        });

        container.append(completeButton, removeButton);
    } else{
        const uncompleteButton = document.createElement('button');
        uncompleteButton.classList.add('btn-uncomplete');
        uncompleteButton.innerText = 'Selesai dibaca';

        uncompleteButton.addEventListener('click', function () {
            addBookToCompleted(bookObject.id);
        });

        const removeButton = document.createElement('button');
        removeButton.classList.add('btn-remove');
        removeButton.innerText = 'Hapus buku';

        removeButton.addEventListener('click', function () {
            removeBook(bookObject.id);
        });

        container.append(uncompleteButton, removeButton);
    }

    return container;
}

function isStorageExist() {
    if(typeof(Storage) === undefined){
        alert('Browser Anda tidak mendukung Web Storage :(');
        return false;
    }
    return true;
}

function saveBookToStorage() {
    const parsedBook = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsedBook);
}

function loadBookFromStorage() {
    const bookData = localStorage.getItem(STORAGE_KEY);
    let itemBookData = JSON.parse(bookData);

    if(itemBookData !== null){
        for (const item of itemBookData) {
            books.push(item);
        }
    }

    document.dispatchEvent(new Event(RENDER_EVENT));
}

document.addEventListener(RENDER_EVENT, function () {
    const uncompletedBook = document.getElementById('uncompleted-book');
    uncompletedBook.innerHTML = '';

    const completedBook = document.getElementById('completed-book');
    completedBook.innerHTML = '';

    for (const bookItem of books) {
        const bookElement = makeBook(bookItem);
        if(bookItem.isComplete){
            completedBook.append(bookElement);
        } else{
            uncompletedBook.append(bookElement);
        }
    }
})

document.addEventListener('DOMContentLoaded', function () {
    const submitForm = document.getElementById('form');
    submitForm.addEventListener('submit', function (event) {
        event.preventDefault();
        addBooks();
    });

    if(isStorageExist()){
        loadBookFromStorage();
    }
    
});

checkButton.addEventListener('click', function () {
    const submitButton = document.getElementById('submit');
    if(checkButton.checked){
        submitButton.setAttribute('value', 'Masukkan buku ke rak \'Selesai dibaca\' ');
    } else{
        submitButton.setAttribute('value', 'Masukkan buku ke rak \'Belum selesai dibaca\' ');
    }
});

searchButton.addEventListener('click', function () {
    const booksTarget = document.getElementById('input-book-title').value;
    if(booksTarget == ''){
        document.dispatchEvent(new Event(RENDER_EVENT));
    } else{
        searchBooks(booksTarget);
    }
});