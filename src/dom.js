import * as build from "./build.js";

let currentProject = "inbox";
let todos = build.loadStorage();
let editingTask;

const addTask = document.querySelector("#add-task");
const addingForm = document.querySelectorAll("#main .adding-form")[0];
const overlays = document.querySelectorAll(".overlay");
const addTodo = addingForm.getElementsByClassName("add-task")[0];
const openNav = document.getElementById("open-nav");
const nav = document.getElementById("nav");
let navBtns = nav.querySelectorAll("button:not(#add-project)");
const addProjectForm = document.querySelectorAll("#nav .add-project-form")[0];
const addProjectBtn = document.getElementById("add-project");
const submitProject =
  addProjectForm.querySelectorAll(`input[type="submit"]`)[0];
const extraProjectsContainer = document.querySelectorAll(
  "#nested-container .projects"
)[0];
const tasksContainer = document.getElementById("tasks");
const checks = document.querySelectorAll("#tasks checked");
const removeProjectButtons = extraProjectsContainer.querySelectorAll(".delete");
const displayDetails = document.querySelector("#display-details");
const specialOverlay = displayDetails.querySelector(".overlay");
const editingForm = document.querySelector("#main .adding-form.edit");
const editTask = editingForm.querySelector(".add-task.edit");

function addingTask() {
  addingForm.classList.add("active");
}
function cancel(parent) {
  const inputs = parent.querySelectorAll(`input:not([type="submit"]),textarea`);
  for (let i = 0; i < inputs.length; i++) {
    if (inputs[i].type == "radio") {
      inputs[i].checked = false;
      continue;
    }
    inputs[i].value = "";
  }
  parent.classList.remove("active");
}
function overlayCancelling() {
  const overlay = event.target;
  const parent = overlay.parentNode;
  cancel(parent);
}
function addingTodo() {
  const btn = event.target;
  event.preventDefault();
  const parent = btn.parentNode;
  const name = parent.getElementsByClassName("title")[0].value;
  const description = parent.querySelectorAll("textarea.description")[0].value;
  const dateEle = document.getElementById("date").value;
  const date = new Date(dateEle);
  const radios = parent.querySelectorAll(`input[type = "radio"]`);
  if (name.split("").includes(" ")) {
    cancel(btn.parentNode.parentNode);
    alert("White spaces are not allowed in the title!");
    return;
  }
  let checkedRadio;
  for (let i = 0; i < radios.length; i++) {
    if (radios[i].checked == true) {
      checkedRadio = radios[i];
      break;
    }
  }
  if (!name || !description || !dateEle || !checkedRadio) {
    alert("please fill out all the fields!");
    return false;
  }
  let priority = checkedRadio.value;
  for (let key of todos[currentProject]) {
    if (key.title == name) {
      cancel(btn.parentNode.parentNode);
      alert("this task is already exist!");
      return;
    }
  }
  let todo = build.createTodo(name, description, date, priority);
  cancel(btn.parentNode.parentNode);
  build.addTodo(todos, currentProject, todo);
  build.setStorage(todos);
  displayProjectTasks(currentProject);
}

function showNav() {
  nav.classList.toggle("show");
}
function displayProject() {
  let btn = event.target;
  //...
  if (btn.id == "today") {
    addTask.classList.add("hide");
  } else {
    addTask.classList.remove("hide");
  }
  let text;
  // to make the button where ever it's clicked return the name of the button
  if (btn.nodeName == "BUTTON") {
    text = btn.querySelector(".text").textContent;
  } else if (
    btn.classList.contains("delete") ||
    btn.classList.contains("fa-xmark") ||
    btn.parentNode.classList.contains("fa-xmark")
  ) {
    return;
  } else {
    while (btn.nodeName != "BUTTON") {
      btn = btn.parentNode;
    }
    text = btn.querySelector(".text").textContent;
  }
  toggleCurrent(text);
}
function toggleCurrent(title) {
  if (title == "Inbox") title = "inbox";
  if (title == "Today") title = "today";
  currentProject = title;
  const current = document.querySelector(`#nav button.${String(title).trim()}`);
  console.log(title, current);
  current.classList.add("current");
  const others = document.querySelectorAll(
    `#nav button:not(.${String(title).trim()})`
  );
  others.forEach((btn) => btn.classList.remove("current"));
  displayProjectTasks(currentProject);
}
function displayProjectTasks(project) {
  tasksContainer.innerHTML = "";
  if (project != "today") {
    const tasks = todos[project];
    tasks.forEach((task) => tasksContainer.appendChild(buildTodo(task)));
  } else {
    const list = build.getTodayTasks(todos);
    let title;
    for (let key in list) {
      for (let task of list[key]) {
        title = task.title + ` (${key})`;
        tasksContainer.appendChild(
          buildTodo({
            title,
            description: task.description,
            date: task.date,
            priority: task.priority,
            checked: task.checked,
          })
        );
      }
    }
  }
}
function buildTodo(todo) {
  const task = document.createElement("div");
  task.classList.add("todo");
  const check = document.createElement("input");
  check.setAttribute("type", "checkbox");
  check.classList.add("checked");
  check.addEventListener("change", checkTask);
  const title = document.createElement("div");
  title.classList.add("title");
  const details = document.createElement("div");
  details.classList.add("details");
  details.textContent = "Details";
  details.addEventListener("click", getDetails);
  const date = document.createElement("div");
  date.classList.add("date");
  const edit = document.createElement("div");
  edit.classList.add("edit");
  edit.addEventListener("click", editDetails);
  const editIcon = document.createElement("i");
  editIcon.classList.add("fas");
  editIcon.classList.add("fa-pen-to-square");
  edit.appendChild(editIcon);
  const trash = document.createElement("div");
  trash.classList.add("delete");
  trash.addEventListener("click", deleteTask);
  const trashIcon = document.createElement("i");
  trashIcon.classList.add("fas");
  trashIcon.classList.add("fa-trash");
  trash.appendChild(trashIcon);
  //setting the values
  check.checked = todo.checked;
  title.textContent = todo.title;
  date.textContent = todo.date;
  task.classList.add(todo.priority);
  task.appendChild(check);
  task.appendChild(title);
  task.appendChild(details);
  task.appendChild(date);
  task.appendChild(edit);
  task.appendChild(trash);
  return task;
}
function addProject(projectTitle) {
  const project = document.createElement("button");
  project.addEventListener("click", displayProject);
  project.classList.add("project");
  project.classList.add(projectTitle);
  const title = document.createElement("div");
  title.classList.add("title");
  const icon = document.createElement("i");
  icon.classList.add("fas");
  icon.classList.add("fa-tasks");
  const text = document.createElement("span");
  text.classList.add("text");
  text.textContent = projectTitle;
  title.appendChild(icon);
  title.appendChild(text);
  const del = document.createElement("div");
  del.classList.add("delete");
  del.addEventListener("click", removeProjectEvent);
  const delIcon = document.createElement("i");
  delIcon.classList.add("fas");
  delIcon.classList.add("fa-times");
  del.appendChild(delIcon);
  project.appendChild(title);
  project.appendChild(del);
  return project;
}
function addProjectBtnEvent() {
  addProjectForm.classList.add("active");
}
function submitProjectEvent() {
  event.preventDefault();
  const btn = event.target;
  const text = addProjectForm.querySelectorAll(`input[type="text"]`)[0];
  const title = text.value;
  if (title.split("").includes(" ")) {
    cancel(btn.parentNode.parentNode);
    alert("White spaces are not allowed in the title!");
    return;
  }
  if (!todos.hasOwnProperty(title)) {
    build.addProject(todos, title);
    const node = addProject(title);
    extraProjectsContainer.appendChild(node);
  }
  cancel(btn.parentNode.parentNode);
  build.setStorage(todos);
}
function checkTask() {
  const ele = event.target;
  let title = ele.nextSibling.textContent;
  if (currentProject != "today") {
    for (let task of todos[currentProject]) {
      if (task.title == title) {
        build.toggleChecked(task);
      }
    }
  } else {
    const titleArray = title.split(" ");
    title = titleArray[0];
    const projectName = titleArray[1].substring(1, titleArray[1].length - 1);
    for (let task of todos[projectName]) {
      if (task.title == title) {
        build.toggleChecked(task);
      }
    }
  }
  build.setStorage(todos);
}
function removeProjectEvent() {
  let btn = event.target;
  while (btn.nodeName != "BUTTON") {
    btn = btn.parentNode;
  }
  const title = btn.querySelector("span.text").textContent;
  let sure = confirm(`Do you want to delete the project ${title} ?`);
  if (sure == 0) {
    return;
  }
  build.deleteProject(todos, title);
  extraProjectsContainer.removeChild(btn);
  toggleCurrent("inbox");
  build.setStorage(todos);
}
function deleteTask() {
  let task = event.target;
  console.log(task.parentNode);
  while (!task.classList.contains("todo")) {
    task = task.parentNode;
  }
  let title = task.querySelector(".title").textContent;
  if (currentProject != "today") {
    build.remove(todos, currentProject, title);
  } else {
    const titleArray = title.split(" ");
    title = titleArray[0];
    const projectName = titleArray[1].substring(1, titleArray[1].length - 1);
    build.remove(todos, projectName, title);
  }
  tasksContainer.removeChild(task);
  build.setStorage(todos);
}

function loadProjects() {
  for (let project in todos) {
    if (project != "inbox") {
      extraProjectsContainer.appendChild(addProject(project));
    }
  }
}
function specialOverlayEvent() {
  const fields = specialOverlay.nextElementSibling.querySelectorAll(".right");
  fields.forEach((field) => (field.textContent = ""));
}
function getDetails() {
  let name = event.target.parentNode.querySelector(".title").textContent;
  const title = displayDetails.querySelector(".title");
  const project = displayDetails.querySelector(".project .right");
  const description = displayDetails.querySelector(".description .right");
  const date = displayDetails.querySelector(".date .right");
  const priority = displayDetails.querySelector(".priority .right");

  if (currentProject != "today") {
    const todo = todos[currentProject].find((item) => item.title == name);
    project.textContent = currentProject;
    description.textContent = todo.description;
    date.textContent = todo.date;
    priority.textContent = todo.priority;
  } else {
    const titleArray = name.split(" ");
    name = titleArray[0];
    const projectName = titleArray[1].substring(1, titleArray[1].length - 1);
    const todo = todos[projectName].find((item) => item.title == name);
    project.textContent = projectName;
    description.textContent = todo.description;
    date.textContent = todo.date;
    priority.textContent = todo.priority;
  }
  title.textContent = name;
  displayDetails.classList.add("active");
}
function editDetails() {
  editingForm.classList.add("active");
  let todo = event.target;
  while (!todo.classList.contains("todo")) {
    todo = todo.parentNode;
  }
  editingTask = todo.querySelector(".title").textContent;
}
function editingTodo() {
  const btn = event.target;
  event.preventDefault();
  const parent = btn.parentNode;
  let name = parent.getElementsByClassName("title")[0].value;
  const description = parent.querySelectorAll("textarea.description")[0].value;
  const dateEle = parent.querySelector(".date input").value;
  const date = new Date(dateEle);
  const radios = parent.querySelectorAll(`input[type = "radio"]`);
  if (name.split("").includes(" ")) {
    cancel(btn.parentNode.parentNode);
    alert("White spaces are not allowed in the title!");
    return;
  }
  let checkedRadio;
  for (let i = 0; i < radios.length; i++) {
    if (radios[i].checked == true) {
      checkedRadio = radios[i];
      break;
    }
  }
  if (!name || !description || !dateEle || !checkedRadio) {
    alert("please fill out all the fields!");
    return false;
  }
  let priority = checkedRadio.value;
  if (currentProject != "today") {
    const task = todos[currentProject].find(
      (todo) => todo.title == editingTask
    );
    const newTodo = build.createTodo(name, description, date, priority);
    newTodo.checked = task.checked;
    Object.assign(task, newTodo);
  } else {
    const titleArray = editingTask.split(" ");
    editingTask = titleArray[0];
    const projectName = titleArray[1].substring(1, titleArray[1].length - 1);
    const task = todos[projectName].find((todo) => todo.title == editingTask);
    const newTodo = build.createTodo(name, description, date, priority);
    newTodo.checked = task.checked;
    Object.assign(task, newTodo);
  }
  editingTodo = "";
  cancel(btn.parentNode.parentNode);
  build.setStorage(todos);
  displayProjectTasks(currentProject);
}

//event listeners
addTask.addEventListener("click", addingTask);
overlays.forEach((overlay) =>
  overlay.addEventListener("click", overlayCancelling)
);
addTodo.addEventListener("click", addingTodo);
openNav.addEventListener("click", showNav);
navBtns.forEach((btn) => btn.addEventListener("click", displayProject));
addProjectBtn.addEventListener("click", addProjectBtnEvent);
submitProject.addEventListener("click", submitProjectEvent);
checks.forEach((check) => check.addEventListener("change", checkTask));
removeProjectButtons.forEach((btn) =>
  btn.addEventListener("click", removeProjectEvent)
);
specialOverlay.addEventListener("click", specialOverlayEvent);
editTask.addEventListener("click", editingTodo);

toggleCurrent(currentProject);
displayProjectTasks(currentProject);

export default loadProjects;
