//-клиентский скрипт подключается в partials/footer.hbs

//^функция обработки валюты
const toCurrency = (price) => {
	return new Intl.NumberFormat("ru-Ru", {
		currency: "rub",
		style: "currency",
	}).format(price);
};

//^функция обработки даты
const toDate = (date) => {
	return new Intl.DateTimeFormat("ru-Ru", {
		day: "2-digit",
		month: "long",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
	}).format(new Date(date));
};

//^находим все элементы в приложении с классом .price
document.querySelectorAll(".price").forEach((node) => {
	node.textContent = toCurrency(node.textContent);
});
//^находим все элементы в приложении с классом .price
document.querySelectorAll(".date").forEach((node) => {
	node.textContent = toDate(node.textContent);
});

//- необходимо выяснить есть ли элемент с id cart
//- знак $ перед переменной означает что это HTML элемент
const $cart = document.querySelector("#cart");

if ($cart) {
	$cart.addEventListener("click", (event) => {
		//- проверяем содержит ли элемент по которому клик  класс "js-remove"
		if (event.target.classList.contains("js-remove")) {
			//- если содержит то забираем его id
			const id = event.target.dataset.id;
			//- вызываем ajax запрос с клиента
			fetch("/cart/remove/" + id, {
				//- HTTP метод для удаления
				method: "delete",
			})
				.then((res) => res.json())
				.then((cart) => {
					if (cart.courses.length) {
						const html = cart.courses
							.map((c) => {
								return `
              <tr>
                <td>${c.title}</td>
                <td>${c.count}</td>
                <td>
                  <button class="btn btn-small js-remove" data-id="${c.id}">Remove</button>
                </td>
              </tr>`;
							})
							.join("");
						$cart.querySelector("tbody").innerHTML = html;
						$cart.querySelector(".price").textContent = toCurrency(
							cart.price
						);
					} else {
						$cart.innerHTML = "<p>Cart is empty</p>";
					}
				});
		}
	});
}

//^иницилизация табов из https://materializecss.com/tabs.html
M.Tabs.init(document.querySelectorAll(".tabs"));
