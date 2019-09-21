import friendEvents from "./friends/eventListeners"
import authorization from "./auth/eventListeners.js";
import eventEvents from "./events/eventListeners.js";
import articleEvents from "./articles/eventListeners.js";
import taskEvents from "./tasks/eventListeners";

/*
    Import all the tools into main.js that are needed to display
    the initial UI to the user. Either the login form should appear
    or the dashboard should be rendered.
*/

//Friends List Object
//****************************

const friendListObject = {
    fillFriendList: function (friendArray, mainUserNum) {
        const friendListElement = document.querySelector("#friends-list")
        friendArray.forEach(element => {
            friendListElement.innerHTML +=
                `
            <div id = "friendCell-${element.id}" class = "friendCell"> 
                <p>${element.userName}</p>
                <button id = "delete-${element.id}" class = "deleteButton">Remove Friend</button>
            </div>
            `
        });
    },

    addToFriendsList: function (event) {
        const userIDAdded = event.target.id.split("-");
        const addedFriend = {
            userId: userIDAdded[1],
            friendInitiate: 1
        }

        fetch("http://localhost:8088/friends", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(addedFriend)
        })
            .then(data => {
                return fetch(`http://localhost:8088/friends?userId=${addedFriend.userId}&friendInitiate=${addedFriend.friendInitiate}&_expand=user`)
                    .then(newFriend => newFriend.json())
                    .then(parsedFriend => {
                        const friendListElement = document.querySelector("#friends-list")
                        friendListElement.innerHTML +=
                            `
            <div id = "friendCell-${parsedFriend[0].id}" class = "friendCell"> 
                <p>${parsedFriend[0].user.userName}</p>
                <button id = "delete-${parsedFriend[0].id}" class = "deleteButton">Remove Friend</button>
            </div>
            `
                        return parsedFriend
                    })
            })
            .then(data => {
                const buttonList = document.querySelectorAll(".deleteButton")
                buttonList.forEach(element => {
                    console.log(element.id)
                    element.addEventListener("click", friendEvents.friendDelete)
                });
            })
    }
}

//JM-Chatlog
//**********************
const chatObject = {
    returnFriendArray: function (mainUserNum) { //Load function with the current user id
        return fetch("http://localhost:8088/friends/?friendInitiate=1&_expand=user") //Fetch the friends of the user
            .then(data => data.json())
            .then(parsedData => {
                let objectArray = []; //Array of users
                parsedData.forEach(dataElement => {
                    const friendObject = { //Collects the id and username of each user.
                        id: dataElement.id,
                        userNum: dataElement.user.id,
                        userName: dataElement.user.userName
                    }
                    objectArray.push(friendObject);
                });
                return objectArray //Returns array
            })
    },

    returnMessagesArray: function (fetchedArray, mainUserNum) { //Returns the friend array and ID of current user
        //Populates the fetch string with multiple querys.
        let fetchString = "http://localhost:8088/messages?_expand=user&_sort=date&_order=asc"
        return fetch(fetchString)
            .then(data => data.json())
            .then(parsedData => {
                document.querySelector("#chat-room").innerHTML += "" //Clears the inner html
                parsedData.forEach(element => {
                    if (mainUserNum === element.userId) { //If the userID matches the user's post...
                        document.querySelector("#chat-room").innerHTML += // Add the edit button with the DOM
                            `
                        <div id = "message-${element.id}" class = "message">
                        <span id = "userId-${element.userId}">${element.user.userName}::</span>
                        <span id = "date-${element.id}">${element.date}:</span>
                        <p id = "innermessage-${element.userId}">${element.message}</p>
                        <button id = "edit-${element.Id}">Edit</button>
                    `
                    }
                    else {
                        document.querySelector("#chat-room").innerHTML +=
                            `
                            <div id = "message-${element.id}" class = "message">
                            <span id = "userId-${element.userId}">${element.user.userName}::</span>
                            <span id = "date-${element.id}">${element.date}:</span>
                            <p id = "innermessage-${element.id}">${element.message}</p>
                        `
                    }
                })
                return parsedData
            })
            .then(parsedData => {
                console.log(parsedData);
                parsedData.forEach(element => {
                    document.querySelector(`#userId-${element.id}`).addEventListener("click", friendListObject.addToFriendsList)
                });
            })
    }
}


//Populates the chatlog and friend list
//****************************

var friendArray = []

chatObject.returnFriendArray(1)
    .then(data => {
        friendArray = data;
        chatObject.returnMessagesArray(friendArray, 1);
        friendListObject.fillFriendList(friendArray, 1);
        return friendArray;
    })
    .then(data => {
        data.forEach(element => {
            document.querySelector(`#friendCell-${element.id}`).addEventListener("click", friendEvents.friendDelete)
        });
    });


authorization();

console.log(
	"main.js sessionStorage.userId: ",
	sessionStorage.getItem("userId")
);

//event event listeners
eventEvents.getAllEvents();
eventEvents.submitEditEvent();
eventEvents.deleteEvent();
eventEvents.editEvent();

//article event listeners
articleEvents.getAllArticles();
articleEvents.submitEditArticles();
articleEvents.deleteArticle();
articleEvents.editArticle();

//task event listeners

taskEvents.getAllTasks();
taskEvents.submitEditTasks();
taskEvents.deleteTask();
taskEvents.editTask();
taskEvents.taskComplete();
taskEvents.finishedTasks();
taskEvents.standardTasks();

//dropdown sections

window.addEventListener("click", event => {
	if (event.target.matches(".dropBtn")) {
		//turn off when clicked if open
		if (event.target.querySelector("#myDropdown").classList.contains("show")) {
			event.target.querySelector("#myDropdown").classList.toggle("show");
		} else {
			//cycle through all dropdown elements and close anything not clicked on
			var dropdowns = document.getElementsByClassName("dropdown-content");
			var i;
			for (i = 0; i < dropdowns.length; i++) {
				var openDropdown = dropdowns[i];
				if (openDropdown.classList.contains("show")) {
					openDropdown.classList.remove("show");
				}
			}
			//open clicked element
			event.target.querySelector("#myDropdown").classList.toggle("show");
		}
	}
});
