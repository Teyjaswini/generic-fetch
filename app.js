const cl = console.log;

const postForm = document.getElementById('postForm')
const titleControl = document.getElementById('title')
const contentControl = document.getElementById('content')
const userIdControl = document.getElementById('userId')
const spinner = document.getElementById('spinner')
const addPostBtn = document.getElementById('addPostBtn')
const updatePostBtn = document.getElementById('updatePostBtn')

// create >> POST
// get from DB >> GET
// remove >> DELETE
// update >> PUT/PATCH

const BASE_URL = `https://crud-14628-default-rtdb.firebaseio.com`

const POSTS_URL = `${BASE_URL}/posts.json`;
const postContainer = document.getElementById('postContainer')

let postsArr = []

function toggleSpinner(flag){
    if(!!flag){
        spinner.classList.remove('d-none')
    }else{
        spinner.classList.add('d-none')
    }

}

function snackbar(msg, icon) {
    Swal.fire({
        title: msg,
        icon: icon,
        timer: 3000
    })
}


const createPostCards = arr => {
    postsArr = arr;
    let result = '';
    for (let i = arr.length - 1; i >= 0; i--) {
        result += `
            <div class="col-md-4 mb-4" id="${arr[i].id}">
                <div class="card h-100">
                    <div class="card-header">
                        <h3>
                            ${arr[i].title}
                        </h3>
                    </div>
                    <div class="card-body">
                        <p class="m-0">
                            ${arr[i].content}
                        </p>
                    </div>
                    <div class="card-footer d-flex justify-content-between">
                        <button 
                        onclick="onEdit(this)"
                        class="btn btn-sm btn-outline-primary">Edit</button>
                        <button 
                        onclick="onRemove(this)"
                        class="btn btn-sm btn-outline-danger">Remove</button>
                    </div>
                </div>
            </div>`

    };

    postContainer.innerHTML = result;

}


function makeApiCall(api_url, methodName, msgBody) {
    msgBody = msgBody ? JSON.stringify(msgBody) : null
    spinner.classList.remove('d-none')
    return fetch(api_url, {
        method: methodName,
        body: msgBody,
        headers: {
            auth: "Token from LS"
        }
    })
        .then(res => {
            return res.json()
        })
    // .then(data => {
    //     // POST >> Create a new card in UI
    //     // GET >> Array >> Templating
    //     // GET >> Obj >> Patch data in from
    //     // PATCH >> Update card in UI
    //     // DELETE >> Remove card from UI
    // })


}


makeApiCall(POSTS_URL, "GET")
    .then(data => {
        for (const key in data) {
            postsArr.push({ ...data[key], id: key })
        }
        cl(postsArr)
        createPostCards(postsArr)
    })
    .catch(err => {
        snackbar(err)
    })
    .finally(() => {
        spinner.classList.add('d-none')
    })


function onPostSubmit(eve) {
    eve.preventDefault();

    let newPost = {
        title: titleControl.value,
        content: contentControl.value,
        userId: userIdControl.value
    }
    cl(newPost)

    // API CALL

    makeApiCall(POSTS_URL, "POST", newPost)
        .then(res => {
            postForm.reset()
            cl(res) // create a new card in UI
            let col = document.createElement('div')
            col.className = `col-md-4 mb-4`
            col.id = res.name
            col.innerHTML = ` 
                <div class="card h-100">
                    <div class="card-header">
                        <h3>
                            ${newPost.title}
                        </h3>
                    </div>
                    <div class="card-body">
                        <p class="m-0">
                            ${newPost.content}
                        </p>
                    </div>
                    <div class="card-footer d-flex justify-content-between">
                        <button 
                        onclick="onEdit(this)"
                        class="btn btn-sm btn-outline-primary">Edit</button>
                        <button 
                        onclick="onRemove(this)"
                        class="btn btn-sm btn-outline-danger">Remove</button>
                    </div>
                </div>`

            postContainer.prepend(col)

        })
        .catch(err => {
            snackbar(err)
        })
        .finally(() => {
            spinner.classList.add('d-none')
        })
}

function onEdit(ele) {
    let EDIT_ID = ele.closest('.col-md-4').id;
    localStorage.setItem('EDIT_ID', EDIT_ID)

    let EDIT_URL = `${BASE_URL}/posts/${EDIT_ID}.json`;

    makeApiCall(EDIT_URL, "GET")
        .then(res => {
            titleControl.value = res.title;
            contentControl.value = res.content;
            userIdControl.value = res.userId;
            addPostBtn.classList.add('d-none')
            updatePostBtn.classList.remove('d-none')
        })
        .catch(err => {
            snackbar(err)
        })
        .finally(() => {
            spinner.classList.add('d-none')
        })
}


function onPostUpdate() {
    // UPDATE_ID
    let UPDATE_ID = localStorage.getItem('EDIT_ID')

    // UPDATE_OBJ
    let UPDATED_OBJ = {
        title: titleControl.value,
        content: contentControl.value,
        userId: userIdControl.value,
        id: UPDATE_ID
    }


    // UPDATE_URL
    let UPDATE_URL = `${BASE_URL}/posts/${UPDATE_ID}.json`

    // API
    makeApiCall(UPDATE_URL, "PATCH", UPDATED_OBJ)
        .then(res => {
            postForm.reset();

            let col = document.getElementById(UPDATE_ID)
            col.querySelector('.card-header h3').innerText = res.title;
            col.querySelector('.card-body p').innerText = res.content;
            updatePostBtn.classList.add('d-none')
            addPostBtn.classList.remove('d-none')
        })
        .catch(err => {
            cl(err)
        })
        .finally(() => {
            spinner.classList.add('d-none')
        })

    // UPDATE IN UI



}

function onRemove(ele) {
    let REMOVE_ID = ele.closest('.col-md-4').id;

    Swal.fire({
        title: `Do you want to remove the post with ID ${REMOVE_ID}?`,
        showCancelButton: true,
        confirmButtonText: "Remove",
    }).then((result) => {
        if (result.isConfirmed) {
            let REMOVE_URL = `${BASE_URL}/posts/${REMOVE_ID}.json`;

            makeApiCall(REMOVE_URL, "DELETE")
                .then(res => {
                    cl(res)
                    ele.closest('.col-md-4').remove()
                })
                .catch(err => {
                    snackbar(err)
                })
                .finally(() => {
                    toggleSpinner()
                })

        }
    });
}


postForm.addEventListener('submit', onPostSubmit)
updatePostBtn.addEventListener('click', onPostUpdate)

