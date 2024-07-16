// Menu responsivo
const navbar = document.querySelector(".navbar");
const menu = document.querySelector(".navbar ul");

navbar.addEventListener("click", () => {
    menu.classList.toggle("show");
});

// Formulário de contato
const form = document.querySelector("#contato form");

form.addEventListener("submit", (event) => {
    event.preventDefault();

    const nome = document.querySelector("#nome").value;
    const email = document.querySelector("#email").value;
    const mensagem = document.querySelector("#mensagem").value;

    if (nome === "" || email === "" || mensagem === "") {
        alert("Preencha todos os campos!");
        return;
    }

    console.log(`Nome: ${nome}`);
    console.log(`Email: ${email}`);
    console.log(`Mensagem: ${mensagem}`);
