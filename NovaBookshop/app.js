let bookList = [],
  basketList = [];

toastr.options = {
  closeButton: false,
  debug: false,
  newestOnTop: false,
  progressBar: false,
  positionClass: "toast-bottom-right",
  preventDuplicates: false,
  onclick: null,
  showDuration: "300",
  hideDuration: "1000",
  timeOut: "5000",
  extendedTimeOut: "1000",
  showEasing: "swing",
  hideEasing: "linear",
  showMethod: "fadeIn",
  hideMethod: "fadeOut",
};

const toggleModal = () => {
  const basketModalEl = document.querySelector(".basket__modal");
  basketModalEl.classList.toggle("active");
};

const getBooks = async () => {
  const res = await fetch("./products.json");
  const books = await res.json();
  bookList = books;
  createBookItemsHtml();
  createBookTypesHtml();
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
const searchInput = document.getElementById('search-input');
searchInput.addEventListener('input', (event) => {
    const query = event.target.value.toLowerCase();
    const filteredBooks = bookList.filter(book => 
        book.name.toLowerCase().includes(query) ||
        book.author.toLowerCase().includes(query)
    );
    createBookItemsHtml(filteredBooks);
});

const createBookItemsHtml = () => {
  const bookListEl = document.querySelector(".book__list");
  let bookListHtml = "";
  bookList.forEach((book, index) => {
    bookListHtml += `<div class="col-5 ${index % 2 === 0 ? "offset-2" : ""} my-5">
    <div class="row book__card" onclick="openBookDetails(${book.id})">
      <div class="col-6">
        <img
          class="img-fluid shadow"
          src="${book.imgSource}"
          width="258"
          height="400"
        />
      </div>
      <div class="col-6 d-flex flex-column justify-content-between">
        <div class="book__detail">
          <span class="fos gray fs-5">${book.author}</span><br />
          <span class="fs-4 fw-bold">${book.name}</span><br />
          <span class="book__star-rate">
            ${createBookStars(book.starRate)}
            <span class="gray">${book.reviewCount} reviews</span>
          </span>
        </div>
        <p class="book__description fos gray">
          ${book.description}
        </p>
        <div>
          <span class="black fw-bold fs-4 me-2">${book.price}₺</span>
          ${book.oldPrice ? `<span class="fs-4 fw-bold old__price">${book.oldPrice}₺</span>` : ""}
        </div>
        <button class="btn__purple" onclick="addBookToBasket(event, ${book.id})">SEPETE EKLEYİNİZ</button>
      </div>
    </div>
  </div>`;
  });

  bookListEl.innerHTML = bookListHtml;
};

const BOOK_TYPES = {
  ALL: "Tümü",
  NOVEL: "Roman",
  CHILDREN: "Çocuk",
  SELFIMPROVEMENT: "Kişisel Gelişim",
  HISTORY: "Tarih",
  FINANCE: "Finans",
  SCIENCE: "Bilim",
};

const createBookTypesHtml = () => {
  const filterEl = document.querySelector(".filter");
  let filterHtml = "";
  let filterTypes = ["ALL"];
  bookList.forEach((book) => {
    if (!filterTypes.includes(book.type)) {
      filterTypes.push(book.type);
    }
  });

  filterTypes.forEach((type, index) => {
    filterHtml += `<li class="${index === 0 ? "active" : ""}" onclick="filterBooks(this)" data-type="${type}">${BOOK_TYPES[type] || type}</li>`;
  });

  filterEl.innerHTML = filterHtml;
};

const filterBooks = async (filterEl) => {
  document.querySelector(".filter .active").classList.remove("active");
  filterEl.classList.add("active");
  let bookType = filterEl.dataset.type;
  await getBooks();
  if (bookType !== "ALL") {
    bookList = bookList.filter((book) => book.type === bookType);
  }
  createBookItemsHtml();
};

const listBasketItems = () => {
  localStorage.setItem("basketList", JSON.stringify(basketList));
  const basketListEl = document.querySelector(".basket__list");
  const basketCountEl = document.querySelector(".basket__count");
  basketCountEl.innerHTML = basketList.length > 0 ? basketList.length : null;
  const totalPriceEl = document.querySelector(".total__price");

  let basketListHtml = "";
  let totalPrice = 0;
  basketList.forEach((item) => {
    totalPrice += item.product.price * item.quantity;
    basketListHtml += `<li class="basket__item">
        <img
          src="${item.product.imgSource}"
          width="100"
          height="100"
        />
        <div class="basket__item-info">
          <h3 class="book__name">${item.product.name}</h3>
          <span class="book__price">${item.product.price}₺</span><br />
          <span class="book__remove" onclick="removeItemFromBasket(${item.product.id})">remove</span>
        </div>
        <div class="book__count">
          <span class="decrease" onclick="decreaseItemInBasket(${item.product.id})">-</span>
          <span class="my-5">${item.quantity}</span>
          <span class="increase" onclick="increaseItemInBasket(${item.product.id})">+</span>
        </div>
      </li>`;
  });

  basketListEl.innerHTML = basketListHtml
    ? basketListHtml
    : `<li class="basket__item">Satın alınacak kitap yok!</li>`;
  totalPriceEl.innerHTML =
    totalPrice > 0 ? "Total : " + totalPrice.toFixed(2) + "₺" : null;
};

const addBookToBasket = (event, bookId) => {
  event.stopPropagation();
  let findedBook = bookList.find((book) => book.id == bookId);
  if (findedBook) {
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

    listBasketItems();
    toastr.success("Kitap sepete eklendi!");
  }
};

const removeItemFromBasket = (bookId) => {
  const findedIndex = basketList.findIndex(
    (basket) => basket.product.id == bookId
  );
  if (findedIndex != -1) {
    basketList.splice(findedIndex, 1);
  }

  listBasketItems();
};

const increaseItemInBasket = (bookId) => {
  const findedIndex = basketList.findIndex(
    (basket) => basket.product.id == bookId
  );
  if (findedIndex != -1) {
    basketList[findedIndex].quantity += 1;
  }

  listBasketItems();
};

const decreaseItemInBasket = (bookId) => {
  const findedIndex = basketList.findIndex(
    (basket) => basket.product.id == bookId
  );
  if (findedIndex != -1) {
    if (basketList[findedIndex].quantity != 0) {
      basketList[findedIndex].quantity -= 1;
    }
    if (basketList[findedIndex].quantity == 0) {
      removeItemFromBasket(bookId);
    }
  }

  listBasketItems();
};

const openBookDetails = (bookId) => {
  window.open(`bookDetails.html?bookId=${bookId}`, "_blank");
};
document.getElementById("user-icon").addEventListener("click", function() { 
  window.location.href = "kayitol.html";  
});
document.addEventListener('DOMContentLoaded', function () {
  const registerForm = document.getElementById('registerForm');
  registerForm.addEventListener('submit', function (e) {
      e.preventDefault(); // Formun varsayılan davranışını engelle
      // Form bilgilerini al
      const username = document.getElementById('username').value;
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      // Burada bu bilgileri sunucuya gönderme veya işleme yapma kodu yer almalı
      // Örneğin, fetch API kullanarak POST isteği gönderebilirsiniz
      // fetch('sunucu/adresi', {
      //     method: 'POST',
      //     body: JSON.stringify({ username, email, password }),
      //     headers: {
      //         'Content-Type': 'application/json'
      //     }
      // })
      // .then(response => response.json())
      // .then(data => {
      //     console.log(data);
      // })
      // .catch(error => {
      //     console.error('Error:', error);
      // });
      // İşlem tamamlandığında kullanıcıya bilgi vermek için istediğiniz yöntemi kullanabilirsiniz
      alert('Üye kaydınız başarıyla oluşturuldu!');
      // Örneğin, kullanıcıyı başka bir sayfaya yönlendirebilirsiniz
      // window.location.href = 'anasayfa.html';
  });
});


window.onload = function () {
  getBooks();
  let savedBasketList = localStorage.getItem("basketList");
  if (savedBasketList) basketList = JSON.parse(savedBasketList);

  listBasketItems();
};
document.addEventListener('DOMContentLoaded', () => {
  fetch('products.json')
      .then(response => response.json())
      .then(data => {
          renderBooks(data);
          setupSearch(data);
      })
      .catch(error => console.error('Error fetching the JSON:', error));
});

function renderBooks(books) {
  const bookList = document.querySelector('.book-list .row');
  bookList.innerHTML = '';
  books.forEach(book => {
      const bookCard = document.createElement('div');
      bookCard.className = 'col-md-3 book__card';
      bookCard.innerHTML = `
          <img src="${book.imgSource}" alt="${book.name}">
          <h3 class="book__title">${book.name}</h3>
          <p class="book__author">${book.author}</p>
          <p class="book__price">${book.price} TL</p>
      `;
      bookList.appendChild(bookCard);
  });
};

function setupSearch(books) {
  const searchInput = document.getElementById('search-input');
  searchInput.addEventListener('input', () => {
      const query = searchInput.value.toLowerCase();
      const bookCards = document.querySelectorAll('.book__card');

      books.forEach((book, index) => {
          const bookCard = bookCards[index];
          if (book.name.toLowerCase().includes(query)) {
              bookCard.classList.add('highlight');
              bookCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
          } else {
              bookCard.classList.remove('highlight');
          }
      });
  });
};
function showBooks() {
  const section = document.querySelector('.store');
  section.scrollIntoView({ behavior: 'smooth' });
};
