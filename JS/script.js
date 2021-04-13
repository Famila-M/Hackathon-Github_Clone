
let api = 'https://api.github.com'


function hideLandingPage() {
    document.getElementById('landing').classList.remove('d-flex');
    document.getElementById('landing').classList.add('hide');
}

async function handleForm(ev) {
    ev.preventDefault();
    
    let user = ev.target.username.value;
    let repo = ev.target.repo.value;


    let userData;
    let repoData;


    if (user !== '' && repo === '') {
        userData = await getUserData(user);
        renderUserProfile(userData);
    }
    else if (user !== '' && repo !== '') {
        userData = await getUserData(user);
        repoData = await getRepoData(user, repo);
        renderUserProfile(userData).then(()=>renderRepo(repoData))
        
    }
    else if (user === '' && repo !== '') {
        document.getElementById('user-error').innerText = 'Please enter the user as well for Repo search';
    }
    else if (user === '' && repo === '') {
        document.getElementById('user-error').innerText = 'Please enter the user field or both fields';
    }
}


async function getUserData(user) {
    try {
        let response = await fetch(`${api}/users/${user}`);
        if (response.status === 404) {
            document.getElementById('user-error').innerText = 'User or Repo not found';
        }
        else {
            let userData = await response.json();
            return userData;
        }
    } catch (err) {
        console.log(err);
    }
}


async function getRepoData(user, repo) {
    try {
        let response = await fetch(`${api}/repos/${user}/${repo}`);
        if (response.status === 404) {
            document.getElementById('user-error').innerText = 'User or Repo not found';
        } else {
            let repoData = await response.json();
            console.log(repoData);
            return repoData;
        }

    } catch (err) {
        console.error(err);
    }
}

async function getRepoListOfUser(repoListLink){
    try{
        let response = await fetch(`${repoListLink}`);
        let repolist = await response.json();
        return repolist;
    }catch(err){
        console.error(err)
    }
}

function renderNavBar() {
    document.getElementById('navbar').classList.remove('d-none');
}



async function renderUserProfile(user) {
    document.getElementById('user').classList.remove('d-none');
    hideLandingPage();
    renderNavBar();
    document.getElementById('repo-nav').innerText = user.public_repos;
    document.getElementById('profile').innerHTML = `<div class="row align-items-center">
         <div class="col-4 col-md-10">
            <img src="${user.avatar_url}" alt="avatar" class="img-fluid rounded-circle">
        </div>
        <div class="col-8 col-md-12">
            ${user.name ? `<div class="row"><h4>${user.name}</h4></div>` : ''}
                <div class="row"><h6 class="text-muted lead">${user.login ? user.login : ''}</h6></div>
            </div>
        </div>
    <div class="row my-2">
        <div class="col-12 pl-0">
            <h4 class="lead">${user.bio ? user.bio : ''}</h4>
            <hr>
        </div>
                                                        
    <div class="col-12 pl-0">
        <h6>${user.location ? `<i class="fa fa-map-marker ml-2"></i> ${user.location}` : ''}</h6>
    </div>
        <div class="col-12 pl-0">
            ${user.blog ? `<a href="https://${user.blog}" class="badge badge-light" style="width: max-content; border-radius:3px; font-size: 18px;"><i class="fa fa-link"></i> ${user.blog}</a><hr>` : ''}
        </div>
        <div class="col-12 pl-0">
            ${user.email ? `<p class="lead"><a class="nav-link pl-0" href="mailto:${user.email}">${user.email}</a></p>` : ''}
        </div>
        <div class="col-12 pl-0">
            ${user.company ? `<p class="lead"><i class="fa fa-building-o text-muted"></i> ${user.company}</p>` : ''}
        </div>
        <div class="col-12 pl-0">
            ${user.followers ? `<span class="lead"><i class="fa fa-users"></i> ${user.followers} Followers</span>` : ''}
        </div>
        <div class="col-12 pl-0">
            ${user.following ? `<span class="lead"><i class="fa fa-user-plus"></i> ${user.following} Following</span>` : ''}
        </div>
    </div>`

    let repoList = await getRepoListOfUser(user.repos_url);
    renderRepoList(repoList);
    document.getElementById('repo-nav-btn').addEventListener('click', ()=> renderRepoList(repoList));
}

function renderRepoList(repoList){
    document.getElementById('repo-nav-text').innerHTML = 'Repositories';
    let repoDiv = document.getElementById('repoList');
    repoDiv.classList.remove('d-none');
    document.getElementById('repo-nav-btn').classList.add('active');
   
    if(repoList.size === 0){
        repoDiv.innerHTML = `User has no repositories`;
    }
    else{
        repoDiv.innerHTML = `${repoList.map((repo)=>{return `
            <div class="my-2">
                <h4 class="repo-name text-primary"><a id="${repo.id}" style="cursor: pointer;">${repo.name}</a></h4>
                    ${
                        repo.description ? `<p class="lead my-2" style="font-size:18px">${repo.description}</p>` : ''
                    }
            <div class="text-muted my-3" style="font-weight:lighter; font-size: 14px;">
                    ${
                        repo.language ? `<span class="mr-3">${repo.language}</span>` : ''
                    }
                    ${
                        repo.license ? `<span class="mr-3"><i class="fa fa-balance-scale"></i> ${repo.license.name}</span>` : ''
                    }
                    ${
                        repo.updated_at ? `<span class="mr-3">${new Date(repo.updated_at).toLocaleString()}</span>` : ''
                    }
            </div>
                <hr>
            </div>
                `;
        }).join('')}
                `;
        repoList.map((repo)=>{
            document.getElementById(`${repo.id}`).addEventListener('click', ()=>renderRepo(repo));
        })    
    }
}


async function getFiles(contentLink){
    try{
        let res = await fetch(contentLink);
        let data = await res.json();
        return data;
    }catch(err){

    }
}

async function renderRepo(repo){

    document.getElementById('repoList').classList.add('d-none');
    document.getElementById('repo-nav-text').innerHTML = 'Go back to Repositories';
    
    let files = await getFiles(repo.contents_url.substring(0, repo.contents_url.indexOf('{')-1));
    
    
    render(files);
    function render(files){
        document.getElementById('repo').innerHTML = `
            <h4 class="text-primary my-4"><span id="render-repo-name" style="cursor:pointer;">${repo.full_name}</span></h4>
        <div class="files">
            ${
                files.map((file)=>{
                    if(file.type === 'file')
                        return `<p class="border p-2"><i class="fa fa-file"></i> ${file.name}</p>`
                    if(file.type === 'dir')
                        return `<p class="border p-2 bg-light" id="${file.name}" style="cursor:pointer;"><i class="fa fa-folder"></i> ${file.name}</p>`
                }).join("")}
        </div>
            `;                                                     
        document.getElementById('render-repo-name').addEventListener('click', ()=>{
            console.log('hello');
            renderRepo(repo);
        })                                                
    }


    files.map((file)=>{
        if(file.type === 'dir'){
            document.getElementById(`${file.name}`).addEventListener('click', async ()=>{
                let files = await getFiles(file.url)
                render(files);
            })
        }
    })
}


document.getElementById('landing-form').addEventListener('submit', handleForm)