const rightArrow = document.querySelector(".right-arrow");
const leftArrow = document.querySelector(".left-arrow");

const section2 = document.querySelector(".section2");

rightArrow.addEventListener("click", handleClickOnRight);

leftArrow.addEventListener("click", handleClickOnLeft);

function handleClickOnRight() {
  const scrollX = section2.scrollLeft + 460;
  section2.scrollTo(scrollX, 0);
  console.log(scrollX);
}

function handleClickOnLeft() {
  const scrollX = section2.scrollLeft - 460;
  section2.scrollTo(scrollX, 0);
  console.log(scrollX);
}