let bookList = [];

const getBooks = async () => {
    const res = await fetch("./products.json");
    const books = await res.json();
    bookList = books;
    displayBookDetails();
};

const displayBookDetails = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const bookId = urlParams.get('bookId');
    const book = bookList.find(book => book.id == bookId);

    if (book) {
        document.getElementById('book-img').src = book.imgSource;
        document.getElementById('book-name').innerText = book.name;
        document.getElementById('book-author').innerText = book.author;
        document.getElementById('book-description').innerText = book.description;
        document.getElementById('book-price').innerText = book.price + '₺';
        document.getElementById('book-old-price').innerText = book.oldPrice ? book.oldPrice + '₺' : '';

        document.getElementById('book-stars').innerHTML = createBookStars(book.starRate);
    }
};

const createBookStars = (starRate) => {
    let starRateHtml = "";
    for (let i = 1; i <= 5; i++) {
        if (Math.round(starRate) >= i)
            starRateHtml += `<i class="bi bi-star-fill active"></i>`;
        else starRateHtml += `<i class="bi bi-star-fill"></i>`;
    }
    return starRateHtml;
};

const addBookToBasket = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const bookId = urlParams.get('bookId');
    let findedBook = bookList.find((book) => book.id == bookId);
    if (findedBook) {
        let basketList = JSON.parse(localStorage.getItem("basketList")) || [];
        const basketAlreadyIndex = basketList.findIndex(
            (basket) => basket.product.id == bookId
        );
        if (basketAlreadyIndex == -1) {
            let addedItem = {
                quantity: 1,
                product: findedBook,
            };
            basketList.push(addedItem);
        } else {
            basketList[basketAlreadyIndex].quantity += 1;
        }

        localStorage.setItem("basketList", JSON.stringify(basketList));
        toastr.success("Kitap sepete eklendi!");
    }
};

window.onload = function () {
    getBooks();
};
