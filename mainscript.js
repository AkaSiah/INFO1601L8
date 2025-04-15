const currentUser = {
    name: "You",
    screen_name: "your_username",
    profile_image_url: "https://randomuser.me/api/portraits/lego/1.jpg"
  };
  
  const tweetInput = document.querySelector("textarea");
  const tweetButton = document.querySelector("button");
  const feed = document.querySelector(".feed");
  const userList = document.getElementById("user-list");
  
  let tweets = JSON.parse(localStorage.getItem("tweets")) || [];
  let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  let followedUsers = JSON.parse(localStorage.getItem("followedUsers")) || [];
  
  function saveTweets() {
    localStorage.setItem("tweets", JSON.stringify(tweets));
  }
  
  function saveFavorites() {
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }
  
  function saveFollowedUsers() {
    localStorage.setItem("followedUsers", JSON.stringify(followedUsers));
  }
  
  function renderTweets(tweetArray) {
    feed.innerHTML = "";
    tweetArray.forEach((tweet, index) => {
      const isFavorite = favorites.includes(tweet.id);
      const tweetDiv = document.createElement("div");
      tweetDiv.className = "tweet";
  
      const commentsHtml = (tweet.comments || [])
        .map(
          comment => `
          <div class="comment">
            <strong>${comment.name}</strong> <span>@${comment.screen_name}</span>: ${comment.text}
          </div>`
        )
        .join("");
  
      tweetDiv.innerHTML = `
        <div class="tweet-header">
          <img src="${tweet.profile_image_url}" width="32" height="32" style="border-radius:50%;vertical-align:middle;margin-right:8px;">
          <strong>${tweet.name}</strong> <span>@${tweet.screen_name}</span> · <span>${new Date(tweet.timestamp).toLocaleString()}</span>
        </div>
        <p>${tweet.text}</p>
        <div class="tweet-actions">
          <button onclick="toggleFavorite('${tweet.id}')">${isFavorite ? "💖" : "🤍"} Favorite</button>
          <button onclick="toggleCommentBox('${tweet.id}')">🗨️ Comment</button>
          ${tweet.screen_name === currentUser.screen_name
            ? `<button onclick="editTweet('${tweet.id}')">✏️ Edit</button>
               <button onclick="deleteTweet('${tweet.id}')">🗑️ Delete</button>`
            : ""}
        </div>
        <div class="comment-box" id="comment-box-${tweet.id}" style="display: none; margin-top: 10px;">
          <textarea id="comment-text-${tweet.id}" rows="2" style="width: 100%;"></textarea>
          <button onclick="submitComment('${tweet.id}')">Post Comment</button>
        </div>
        <div class="comments">${commentsHtml}</div>
      `;
      feed.appendChild(tweetDiv);
    });
  }
  
  function toggleCommentBox(tweetId) {
    const box = document.getElementById(`comment-box-${tweetId}`);
    box.style.display = box.style.display === "none" ? "block" : "none";
  }
  
  function submitComment(tweetId) {
    const tweet = tweets.find(t => t.id === tweetId);
    const textarea = document.getElementById(`comment-text-${tweetId}`);
    const text = textarea.value.trim();
    if (!text) return;
  
    const comment = {
      name: currentUser.name,
      screen_name: currentUser.screen_name,
      text,
      timestamp: new Date().toISOString()
    };
  
    if (!tweet.comments) tweet.comments = [];
    tweet.comments.push(comment);
    textarea.value = "";
  
    saveTweets();
    renderTweets(tweets);
  }
  
  function showAll() {
    renderTweets(tweets);
  }
  
  function showFavorites() {
    const favs = tweets.filter(t => favorites.includes(t.id));
    renderTweets(favs);
  }
  
  tweetButton.addEventListener("click", () => {
    const text = tweetInput.value.trim();
    if (!text) return;
  
    const newTweet = {
      id: Date.now().toString(),
      text,
      timestamp: new Date().toISOString(),
      name: currentUser.name,
      screen_name: currentUser.screen_name,
      profile_image_url: currentUser.profile_image_url,
      comments: []
    };
  
    tweets.unshift(newTweet);
    saveTweets();
    tweetInput.value = "";
    renderTweets(tweets);
  });
  
  function toggleFavorite(id) {
    if (favorites.includes(id)) {
      favorites = favorites.filter(f => f !== id);
    } else {
      favorites.push(id);
    }
    saveFavorites();
    renderTweets(tweets);
  }
  
  function editTweet(id) {
    const tweet = tweets.find(t => t.id === id);
    const newText = prompt("Edit your tweet:", tweet.text);
    if (newText !== null) {
      tweet.text = newText;
      saveTweets();
      renderTweets(tweets);
    }
  }
  
  function deleteTweet(id) {
    tweets = tweets.filter(t => t.id !== id);
    saveTweets();
    renderTweets(tweets);
  }
  
  fetch("data.json")
    .then(res => res.json())
    .then(data => {
      const users = data.users;
  
      users.forEach(user => {
        const li = document.createElement("li");
        const isFollowed = followedUsers.includes(user.screen_name);
  
        li.innerHTML = `
          <img src="${user.profile_image_url}" alt="${user.name}" width="32" height="32" style="border-radius:50%;vertical-align:middle;margin-right:8px;">
          ${user.name}
          <button onclick="toggleFollow('${user.screen_name}')">
            ${isFollowed ? "Unfollow" : "Follow"}
          </button>
        `;
        userList.appendChild(li);
  
        // Add their tweet to the feed
        if (user.status) {
          const tweet = {
            id: Date.now().toString() + Math.random(),
            text: user.status.text,
            timestamp: user.status.created_at,
            name: user.name,
            screen_name: user.screen_name,
            profile_image_url: user.profile_image_url,
            comments: []
          };
          tweets.push(tweet);
        }
      });
  
      saveTweets();
      renderTweets(tweets);
    });
  
  function toggleFollow(screen_name) {
    if (followedUsers.includes(screen_name)) {
      followedUsers = followedUsers.filter(sn => sn !== screen_name);
    } else {
      followedUsers.push(screen_name);
    }
    saveFollowedUsers();
    userList.innerHTML = "";
    fetch("data.json")
      .then(res => res.json())
      .then(data => {
        data.users.forEach(user => {
          const li = document.createElement("li");
          const isFollowed = followedUsers.includes(user.screen_name);
          li.innerHTML = `
            <img src="${user.profile_image_url}" alt="${user.name}" width="32" height="32" style="border-radius:50%;vertical-align:middle;margin-right:8px;">
            ${user.name}
            <button onclick="toggleFollow('${user.screen_name}')">
              ${isFollowed ? "Unfollow" : "Follow"}
            </button>
          `;
          userList.appendChild(li);
        });
      });
  }