document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        const participantsList = details.participants
          .map(participant => `<li>${participant} <span class='delete-icon' data-activity='${name}' data-participant='${participant}'>&times;</span></li>`)
          .join("");

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
          <div class="participants-section">
            <h5>Participants:</h5>
            <ul>${participantsList}</ul>
          </div>
        `;

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });

      addDeleteListeners();
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  function addDeleteListeners() {
    document.querySelectorAll(".delete-icon").forEach(icon => {
      icon.addEventListener("click", async (event) => {
        const activity = event.target.dataset.activity;
        const participant = event.target.dataset.participant;

        try {
          const response = await fetch(`/activities/${encodeURIComponent(activity)}/unregister`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ participant }),
          });

          if (response.ok) {
            updateActivityCard(activity);
          } else {
            console.error("Failed to unregister participant");
          }
        } catch (error) {
          console.error("Error unregistering participant:", error);
        }
      });
    });
  }

  async function updateActivityCard(activityName) {
    try {
      const response = await fetch(`/activities/${encodeURIComponent(activityName)}`);
      const details = await response.json();

      const activityCard = Array.from(activitiesList.children).find(card => 
        card.querySelector("h4").textContent === activityName
      );

      if (activityCard) {
        const spotsLeft = details.max_participants - details.participants.length;
        const participantsList = details.participants
          .map(participant => `<li>${participant} <span class='delete-icon' data-activity='${activityName}' data-participant='${participant}'>&times;</span></li>`)
          .join("");

        activityCard.querySelector(".participants-section ul").innerHTML = participantsList;
        activityCard.querySelector(".participants-section ul").innerHTML = participantsList;
        activityCard.querySelector("strong").textContent = `${spotsLeft} spots left`;

        addDeleteListeners();
      }
    } catch (error) {
      console.error("Error updating activity card:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
        updateActivityCard(activity); // Dynamically update the activity card
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
