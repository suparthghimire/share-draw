let modifyClassList = (el, className, flag) => {
  if (flag == 1) el.classList.add(className);
  else if (flag == 2) el.classList.remove(className);
};

// event listeners
document.querySelector("#chat").addEventListener("click", () => {
  const artboardDetail = document.querySelector(".artboard-details");
  modifyClassList(artboardDetail, "artboard-detail-slide", 1);
});

document.querySelector("#all-users").addEventListener("click", () => {
  const artboardDetail = document.querySelector(".artboard-details");
  modifyClassList(artboardDetail, "artboard-detail-slide", 1);
});

document.querySelector(".btn-close-sidebar").addEventListener("click", () => {
  const artboardDetail = document.querySelector(".artboard-details");
  modifyClassList(artboardDetail, "artboard-detail-slide", 2);
});

document.querySelector("#user-tab-btn").addEventListener("click", () => {
  const userTab = document.querySelector("#users-tab");
  const chatTab = document.querySelector("#chat-tab");

  modifyClassList(userTab, "tab-content-scale-1", 1);
  if (chatTab.classList.contains("tab-content-scale-1")) {
    modifyClassList(chatTab, "tab-content-scale-1", 2);
  }
});

document.querySelector("#chat-tab-btn").addEventListener("click", () => {
  const userTab = document.querySelector("#users-tab");
  const chatTab = document.querySelector("#chat-tab");

  modifyClassList(chatTab, "tab-content-scale-1", 1);
  if (userTab.classList.contains("tab-content-scale-1")) {
    modifyClassList(userTab, "tab-content-scale-1", 2);
  }
});
