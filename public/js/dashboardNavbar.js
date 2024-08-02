function search() {
    console.log("Search!");
    const searchContent = document.querySelector(".search-input").value;
    //const mostPopular = document.querySelector(".most-popular-input").checked;
    //const cheapest = document.querySelector(".cheapest-input").checked;
    fetch(`/dashboard/search?value=${searchContent}`, { method: "GET" });
    window.location.href = `/dashboard/search?value=${searchContent}`;
}