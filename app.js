// Initialize Supabase
const supabaseUrl = 'https://ntwcyqjxzayaiysirwwb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50d2N5cWp4emF5YWl5c2lyd3diIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI4OTA1OTIsImV4cCI6MjA2ODQ2NjU5Mn0.KHhzG_Y90-XYG85vPWWJsCoNqetd1UHdLsv-e7d7Z8A';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// Tab functionality
function openTab(evt, tabName) {
  const tabcontent = document.getElementsByClassName("tabcontent");
  for (let i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }
  
  const tablinks = document.getElementsByClassName("tablinks");
  for (let i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }
  
  document.getElementById(tabName).style.display = "block";
  evt.currentTarget.className += " active";
  
  // Refresh data when tab is opened
  if (tabName === 'Region') loadRegions();
  if (tabName === 'Users') loadUsers();
  if (tabName === 'Tasks') loadTasks();
  if (tabName === 'Reports') generateReport();
}

// Region Functions
async function addRegion() {
  const regionName = document.getElementById('regionName').value;
  if (!regionName) return alert('Please enter a region name');
  
  const { data, error } = await supabase
    .from('Region')
    .insert([{ Region_Name: regionName }]);
  
  if (error) {
    console.error('Error adding region:', error);
    alert('Error adding region');
  } else {
    document.getElementById('regionName').value = '';
    loadRegions();
    alert('Region added successfully');
  }
}

async function loadRegions() {
  const { data, error } = await supabase
    .from('Region')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error loading regions:', error);
    return;
  }
  
  let html = '<table><tr><th>ID</th><th>Region Name</th><th>Created At</th></tr>';
  data.forEach(region => {
    html += `<tr>
      <td>${region.id}</td>
      <td>${region.Region_Name}</td>
      <td>${new Date(region.created_at).toLocaleString()}</td>
    </tr>`;
  });
  html += '</table>';
  
  document.getElementById('regionsList').innerHTML = html;
  
  // Also update region dropdown in Users form
  updateRegionDropdown();
}

function updateRegionDropdown() {
  supabase
    .from('Region')
    .select('*')
    .then(({ data }) => {
      const dropdown = document.getElementById('userRegion');
      dropdown.innerHTML = '<option value="">Select Region</option>';
      data.forEach(region => {
        dropdown.innerHTML += `<option value="${region.id}">${region.Region_Name}</option>`;
      });
    });
}

// User Functions
async function addUser() {
  const userName = document.getElementById('userName').value;
  const userAge = document.getElementById('userAge').value;
  const locationId = document.getElementById('userRegion').value;
  
  if (!userName || !userAge) return alert('Please fill all required fields');
  
  const { data, error } = await supabase
    .from('myusers')
    .insert([{ 
      user_name: userName, 
      user_age: userAge,
      LocationID: locationId || null
    }]);
  
  if (error) {
    console.error('Error adding user:', error);
    alert('Error adding user');
  } else {
    document.getElementById('userName').value = '';
    document.getElementById('userAge').value = '';
    loadUsers();
    updateUserDropdown();
    alert('User added successfully');
  }
}

async function loadUsers() {
  const { data, error } = await supabase
    .from('myusers')
    .select('*, Region(Region_Name)')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error loading users:', error);
    return;
  }
  
  let html = '<table><tr><th>ID</th><th>Name</th><th>Age</th><th>Region</th><th>Created At</th></tr>';
  data.forEach(user => {
    html += `<tr>
      <td>${user.id}</td>
      <td>${user.user_name}</td>
      <td>${user.user_age}</td>
      <td>${user.Region?.Region_Name || 'None'}</td>
      <td>${new Date(user.created_at).toLocaleString()}</td>
    </tr>`;
  });
  html += '</table>';
  
  document.getElementById('usersList').innerHTML = html;
}

function updateUserDropdown() {
  supabase
    .from('myusers')
    .select('*')
    .then(({ data }) => {
      const dropdown = document.getElementById('taskUser');
      dropdown.innerHTML = '<option value="">Select User</option>';
      data.forEach(user => {
        dropdown.innerHTML += `<option value="${user.id}">${user.user_name}</option>`;
      });
    });
}

// Task Functions
async function addTask() {
  const taskTitle = document.getElementById('taskTitle').value;
  const userId = document.getElementById('taskUser').value;
  
  if (!taskTitle) return alert('Please enter a task title');
  
  const { data, error } = await supabase
    .from('tasks')
    .insert([{ 
      title: taskTitle,
      UserID: userId || null
    }]);
  
  if (error) {
    console.error('Error adding task:', error);
    alert('Error adding task');
  } else {
    document.getElementById('taskTitle').value = '';
    loadTasks();
    alert('Task added successfully');
  }
}

async function loadTasks() {
  const { data, error } = await supabase
    .from('tasks')
    .select('*, myusers(user_name)')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error loading tasks:', error);
    return;
  }
  
  let html = '<table><tr><th>ID</th><th>Title</th><th>Completed</th><th>Assigned To</th><th>Created At</th></tr>';
  data.forEach(task => {
    html += `<tr>
      <td>${task.id}</td>
      <td>${task.title}</td>
      <td>${task.is_completed ? 'Yes' : 'No'}</td>
      <td>${task.myusers?.user_name || 'Unassigned'}</td>
      <td>${new Date(task.created_at).toLocaleString()}</td>
    </tr>`;
  });
  html += '</table>';
  
  document.getElementById('tasksList').innerHTML = html;
}

// Report Functions
async function generateReport() {
  // Simple report showing user count by region
  const { data, error } = await supabase
    .from('myusers')
    .select('*, Region(Region_Name)');
  
  if (error) {
    console.error('Error generating report:', error);
    return;
  }
  
  // Group users by region
  const reportData = {};
  data.forEach(user => {
    const regionName = user.Region?.Region_Name || 'No Region';
    if (!reportData[regionName]) {
      reportData[regionName] = { count: 0, totalAge: 0 };
    }
    reportData[regionName].count++;
    reportData[regionName].totalAge += user.user_age;
  });
  
  // Generate HTML
  let html = '<h3>User Count by Region</h3>';
  html += '<table><tr><th>Region</th><th>User Count</th><th>Average Age</th></tr>';
  
  for (const [region, stats] of Object.entries(reportData)) {
    const avgAge = (stats.totalAge / stats.count).toFixed(1);
    html += `<tr>
      <td>${region}</td>
      <td>${stats.count}</td>
      <td>${avgAge}</td>
    </tr>`;
  }
  
  html += '</table>';
  document.getElementById('userReport').innerHTML = html;
}

// Initialize the app when loaded
document.addEventListener('DOMContentLoaded', function() {
  loadRegions();
  loadUsers();
  loadTasks();
  updateUserDropdown();
});
// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js')
      .then(registration => {
        console.log('ServiceWorker registration successful');
      })
      .catch(err => {
        console.log('ServiceWorker registration failed: ', err);
      });
  });
}