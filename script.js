/************ CONFIG ************/
const BIN_ID   = "68bb5669d0ea881f40733227";   // your bin id
const API_KEY  = "$2a$10$eFrRV6BfZQFdUkldk2BExOtYmnRjlpzeRt4/D4sgFXOzQopUSbZKi"; // your X-Master-Key
const BASE_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;
/********************************/

/******** FETCH & SAVE HELPERS ********/
async function fetchCustomers() {
  const res = await fetch(BASE_URL + "/latest", {
    method: "GET",
    headers: {
      "X-Master-Key": API_KEY,
      "X-Bin-Meta": "false"
    }
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`GET ${res.status}: ${text}`);
  const data = JSON.parse(text);

  // Bin shape is always { "record": [ ... ] }
  return data.record || [];
}

async function saveCustomers(customers) {
  const body = { record: customers }; // wrap inside { record: [] }
  const res = await fetch(BASE_URL, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "X-Master-Key": API_KEY
    },
    body: JSON.stringify(body)
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`PUT ${res.status}: ${text}`);
  return JSON.parse(text);
}

/******** FORM (index.html) ********/
const form = document.getElementById("customerForm");
if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const msgEl = document.getElementById("message");

    const customer = {
      firstName: document.getElementById("firstName").value.trim(),
      lastName:  document.getElementById("lastName").value.trim(),
      age:       parseInt(document.getElementById("age").value, 10),
      height:    parseInt(document.getElementById("height").value, 10),
      weight:    parseInt(document.getElementById("weight").value, 10)
    };

    // basic validation
    if (customer.age <= 0 || customer.height <= 0 || customer.weight <= 0) {
      msgEl.textContent = "⚠️ Please enter valid values.";
      return;
    }

    try {
      const customers = await fetchCustomers();
      customers.push(customer);
      await saveCustomers(customers);

      msgEl.textContent = "✅ Your info has been submitted!";
      form.reset();
    } catch (err) {
      console.error(err);
      msgEl.textContent = `❌ Something went wrong. ${err.message}`;
    }
  });
}

/******** ADMIN (admin.html) ********/
const customerList = document.getElementById("customerList");
if (customerList) {
  (async () => {
    try {
      const customers = await fetchCustomers();
      if (!customers.length) {
        customerList.innerHTML = "<p>No submissions yet.</p>";
        return;
      }
      customerList.innerHTML = customers.map(c => `
        <div class="customer-card">
          <h3>${c.firstName || ""} ${c.lastName || ""}</h3>
          <p>Age: ${c.age || "-"}</p>
          <p>Height: ${c.height || "-"} cm</p>
          <p>Weight: ${c.weight || "-"} kg</p>
        </div>
      `).join("");
    } catch (err) {
      console.error(err);
      customerList.innerHTML = `<p>❌ Error loading data. ${err.message}</p>`;
    }
  })();
}

