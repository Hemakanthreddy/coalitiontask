const API_URL = "https://workers.dev";
const username = "coalitiondev"; 
const password = "interviews"; 

async function fetchPatientData() {
    try {
        const response = await fetch(API_URL, {
            mode: 'cors', // Explicitly enables Cross-Origin Resource Sharing request structures
            headers: {
                'Authorization': 'Basic ' + btoa(username + ":" + password),
                'Accept': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP network error: status code ${response.status}`);
        }
        
        const data = await response.json();
        const jessica = data.find(p => p.name === "Jessica Taylor");
        
        if (jessica) {
            populateUI(jessica);
            renderChart(jessica.diagnosis_history);
        }
    } catch (error) {
        console.error("The API block failed to load metrics onto the page:", error);
    }
}

function populateUI(patient) {
    document.getElementById("patient-photo").src = patient.profile_picture;
    document.getElementById("sidebar-avatar").src = patient.profile_picture;
    document.getElementById("sidebar-name").innerText = patient.name;
    document.getElementById("sidebar-gender-age").innerText = `${patient.gender}, ${patient.age}`;
    document.getElementById("dob").innerText = patient.date_of_birth;
    document.getElementById("gender").innerText = patient.gender;
    document.getElementById("phone").innerText = patient.phone_number;
    document.getElementById("insurance").innerText = patient.insurance_type;

    const latest = patient.diagnosis_history[0];
    if (latest) {
        document.getElementById("systolic-val").innerText = latest.blood_pressure.systolic.value;
        document.getElementById("systolic-status").innerText = latest.blood_pressure.systolic.levels;
        document.getElementById("diastolic-val").innerText = latest.blood_pressure.diastolic.value;
        document.getElementById("diastolic-status").innerText = latest.blood_pressure.diastolic.levels;

        document.getElementById("resp-rate").innerText = `${latest.respiratory_rate.value} bpm`;
        document.getElementById("resp-status").innerText = latest.respiratory_rate.levels;
        document.getElementById("temp-rate").innerText = `${latest.temperature.value} °F`;
        document.getElementById("temp-status").innerText = latest.temperature.levels;
        document.getElementById("heart-rate").innerText = `${latest.heart_rate.value} bpm`;
        document.getElementById("heart-status").innerText = latest.heart_rate.levels;
    }

    let diagRows = "";
    patient.diagnostic_list.forEach(item => {
        diagRows += `<tr><td><strong>${item.name}</strong></td><td>${item.description}</td><td>${item.status}</td></tr>`;
    });
    document.getElementById("diagnostic-tbody").innerHTML = diagRows;

    let labItems = "";
    patient.lab_results.forEach(res => {
        labItems += `<li><span>${res}</span><button style="border:none;background:none;cursor:pointer;">📥</button></li>`;
    });
    document.getElementById("lab-results-list").innerHTML = labItems;
}

function renderChart(history) {
    const recent = history.slice(0, 6).reverse();
    const labels = recent.map(i => `${i.month.substring(0,3)}, ${i.year}`);
    const systolic = recent.map(i => i.blood_pressure.systolic.value);
    const diastolic = recent.map(i => i.blood_pressure.diastolic.value);

    new Chart(document.getElementById('bpChart').getContext('2d'), {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                { data: systolic, borderColor: '#E66FD2', tension: 0.4, fill: false },
                { data: diastolic, borderColor: '#8C6FE6', tension: 0.4, fill: false }
            ]
        },
        options: { plugins: { legend: { display: false } } }
    });
}

window.addEventListener('DOMContentLoaded', fetchPatientData);
