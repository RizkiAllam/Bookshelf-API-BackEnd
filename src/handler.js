/* eslint-disable linebreak-style */
/* eslint-disable indent */
/* eslint-disable linebreak-style */
// Import books data module
const books = require('./books');

// Handler for adding a new book
const addBookHandler = async (request, h) => {
    const {
        name,
        year,
        author,
        summary,
        publisher,
        pageCount,
        readPage,
        reading,
    } = request.payload;

    // Validate request payload
    if (!name) {
        return h
        .response({
            status: 'fail',
            message: 'Gagal menambahkan buku. Mohon isi nama buku',
        })
        .code(400);
    }

    // Validate readPage and pageCount
    if (readPage > pageCount) {
        return h
        .response({
            status: 'fail',
            message: 'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount',
        })
        .code(400);
    }

    try {
        // Dynamically import nanoid module
        // eslint-disable-next-line import/no-extraneous-dependencies
        const { nanoid } = await import('nanoid');

        // Generate unique ID for the new book
        const id = nanoid(16);
        const finished = pageCount === readPage;
        const insertedAt = new Date().toISOString();
        const updatedAt = insertedAt;

        // Create new book object
        const newBook = {
            name,
            year,
            author,
            summary,
            publisher,
            pageCount,
            readPage,
            reading,
            id,
            finished,
            insertedAt,
            updatedAt,
        };

        // Add the new book to the books array
        books.push(newBook);

        // Check if the book was successfully added
        const isSuccess = books.filter((note) => note.id === id).length > 0;

        if (isSuccess) {
            return h
            .response({
                status: 'success',
                message: 'Buku berhasil ditambahkan',
                data: {
                    bookId: id,
                },
            })
            .code(201);
        }

        // Handle failure to add book
        return h
            .response({
                status: 'fail',
                message: 'Buku gagal ditambahkan',
            })
            .code(500);
    } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Error importing nanoid:', err);
        return h
            .response({
                status: 'fail',
                message: 'Internal server error',
            })
            .code(500);
    }
};

// Handler for getting all books
const getAllBooksHandler = (request, h) => {
    const { name, reading, finished } = request.query;

    // Check if there are no query parameters
    if (!name && !reading && !finished) {
        return h
        .response({
            status: 'success',
            data: {
                books: books.map((book) => ({
                    id: book.id,
                    name: book.name,
                    publisher: book.publisher,
                })),
            },
        })
        .code(200);
    }

    // Handle filtering based on name query
    if (name) {
        const filteredBooksName = books.filter((book) => {
        const nameRegex = new RegExp(name, 'gi');
        return nameRegex.test(book.name);
        });

        return h
        .response({
            status: 'success',
            data: {
            books: filteredBooksName.map((book) => ({
                id: book.id,
                name: book.name,
                publisher: book.publisher,
            })),
            },
        })
        .code(200);
    }

    // Handle filtering based on reading query
    if (reading) {
        const filteredBooksReading = books.filter(
        (book) => Number(book.reading) === Number(reading),
        );

        return h
        .response({
            status: 'success',
            data: {
                books: filteredBooksReading.map((book) => ({
                    id: book.id,
                    name: book.name,
                    publisher: book.publisher,
                })),
            },
        })
        .code(200);
    }

    // Handle filtering based on finished query
    const filteredBooksFinished = books.filter(
        (book) => Number(book.finished) === Number(finished),
    );

    return h
        .response({
        status: 'success',
        data: {
            books: filteredBooksFinished.map((book) => ({
                id: book.id,
                name: book.name,
                publisher: book.publisher,
            })),
        },
        })
        .code(200);
};

// Handler for getting a book by ID
const getBookByIdHandler = (request, h) => {
    const { bookId } = request.params;

    // Find the book by ID
    const book = books.filter((n) => n.id === bookId)[0];

    if (book) {
        return h
        .response({
            status: 'success',
            data: {
                book,
            },
        })
        .code(200);
    }

    // Handle book not found
    return h
        .response({
            status: 'fail',
            message: 'Buku tidak ditemukan',
        })
        .code(404);
};

// Handler for updating a book by ID
const editBookByIdHandler = (request, h) => {
    const { bookId } = request.params;

    const {
        name,
        year,
        author,
        summary,
        publisher,
        pageCount,
        readPage,
        reading,
    } = request.payload;

    // Validate request payload
    if (!name) {
        return h
        .response({
            status: 'fail',
            message: 'Gagal memperbarui buku. Mohon isi nama buku',
        })
        .code(400);
    }

    // Validate readPage and pageCount
    if (readPage > pageCount) {
        return h
        .response({
            status: 'fail',
            message: 'Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount',
        })
        .code(400);
    }

    const finished = pageCount === readPage;
    const updatedAt = new Date().toISOString();

    const index = books.findIndex((note) => note.id === bookId);

    if (index !== -1) {
        books[index] = {
        ...books[index],
        name,
        year,
        author,
        summary,
        publisher,
        pageCount,
        readPage,
        reading,
        finished,
        updatedAt,
        };

        return h
        .response({
            status: 'success',
            message: 'Buku berhasil diperbarui',
        })
        .code(200);
    }

    // Handle book ID not found
    return h
        .response({
            status: 'fail',
            message: 'Gagal memperbarui buku. Id tidak ditemukan',
        })
        .code(404);
};

// Handler for deleting a book by ID
const deleteBookByIdHandler = (request, h) => {
    const { bookId } = request.params;

    const index = books.findIndex((note) => note.id === bookId);

    if (index !== -1) {
        books.splice(index, 1);

        return h
        .response({
            status: 'success',
            message: 'Buku berhasil dihapus',
        })
        .code(200);
    }

    // Handle book ID not found
    return h
        .response({
            status: 'fail',
            message: 'Buku gagal dihapus. Id tidak ditemukan',
        })
        .code(404);
};

module.exports = {
    addBookHandler,
    getAllBooksHandler,
    getBookByIdHandler,
    editBookByIdHandler,
    deleteBookByIdHandler,
};
