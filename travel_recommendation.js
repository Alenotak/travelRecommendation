// Global variable to store travel data
let travelData = null;

// Fetch data from JSON file
fetch('travel_recommendation_api.json')
    .then(response => response.json())
    .then(data => {
        console.log('Data successfully loaded:', data);
        travelData = data;
    })
    .catch(error => {
        console.error('Error fetching data:', error);
    });

// Search button functionality
document.getElementById('searchBtn').addEventListener('click', function() {
    const searchInput = document.getElementById('searchInput').value.toLowerCase().trim();
    console.log('Searching for:', searchInput);
    
    if (searchInput) {
        searchRecommendations(searchInput);
    }
});

// Reset button functionality
document.getElementById('resetBtn').addEventListener('click', function() {
    document.getElementById('searchInput').value = '';
    clearResults();
});

// Allow Enter key to trigger search
document.getElementById('searchInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        document.getElementById('searchBtn').click();
    }
});

// Search function with keyword variations
function searchRecommendations(keyword) {
    if (!travelData) {
        alert('Data is still loading. Please try again.');
        return;
    }
    
    let results = [];
    
    // Normalize keyword to handle variations
    const normalizedKeyword = keyword.toLowerCase();
    
    // Check for beach/beaches
    if (normalizedKeyword.includes('beach')) {
        results = travelData.beaches;
    }
    // Check for temple/temples
    else if (normalizedKeyword.includes('temple')) {
        results = travelData.temples;
    }
    // Check for country/countries
    else if (normalizedKeyword.includes('countr') || normalizedKeyword.includes('australia') || 
             normalizedKeyword.includes('japan') || normalizedKeyword.includes('brazil')) {
        // Search through countries and get all cities
        travelData.countries.forEach(country => {
            if (country.name.toLowerCase().includes(normalizedKeyword) || 
                normalizedKeyword.includes('countr')) {
                results = results.concat(country.cities);
            }
        });
    }
    // Search in specific city names
    else {
        // Search through all cities
        travelData.countries.forEach(country => {
            country.cities.forEach(city => {
                if (city.name.toLowerCase().includes(normalizedKeyword)) {
                    results.push(city);
                }
            });
        });
        
        // Search through temples
        travelData.temples.forEach(temple => {
            if (temple.name.toLowerCase().includes(normalizedKeyword)) {
                results.push(temple);
            }
        });
        
        // Search through beaches
        travelData.beaches.forEach(beach => {
            if (beach.name.toLowerCase().includes(normalizedKeyword)) {
                results.push(beach);
            }
        });
    }
    
    displayResults(results, keyword);
}

// Display results function
function displayResults(results, keyword) {
    const resultsContent = document.getElementById('results-content');
    const resultsTitle = document.getElementById('results-title');
    
    // Clear previous results
    resultsContent.innerHTML = '';
    
    if (results.length === 0) {
        resultsTitle.style.display = 'block';
        resultsTitle.textContent = 'No Results Found';
        resultsContent.innerHTML = '<div class="no-results">Sorry, no recommendations found for "' + keyword + '". Try searching for beaches, temples, or countries.</div>';
        
        // Scroll to results
        document.getElementById('results').scrollIntoView({ behavior: 'smooth' });
        return;
    }
    
    resultsTitle.style.display = 'block';
    resultsTitle.textContent = 'Recommendations for "' + keyword + '"';
    
    // Create cards for each result
    results.forEach(item => {
        const card = document.createElement('div');
        card.className = 'result-card';
        
       // Get local time for the destination
const localTime = getLocalTime(item.name);

card.innerHTML = `
    <img src="${item.imageUrl}" alt="${item.name}">
    <div class="result-card-content">
        <h3>${item.name}</h3>
        ${localTime ? `<p class="local-time"><strong>Local Time:</strong> ${localTime}</p>` : ''}
        <p>${item.description}</p>
        <button onclick="alert('Booking feature coming soon for ${item.name}!')">Visit</button>
    </div>
`;
        
        resultsContent.appendChild(card);
    });
    
    // Scroll to results
    document.getElementById('results').scrollIntoView({ behavior: 'smooth' });
}

// Clear results function
function clearResults() {
    const resultsContent = document.getElementById('results-content');
    const resultsTitle = document.getElementById('results-title');
    
    resultsContent.innerHTML = '';
    resultsTitle.style.display = 'none';
    
    console.log('Results cleared');
}
// Get local time for destination
function getLocalTime(locationName) {
    // Map locations to time zones
    const timeZones = {
        'Sydney': 'Australia/Sydney',
        'Melbourne': 'Australia/Melbourne',
        'Tokyo': 'Asia/Tokyo',
        'Kyoto': 'Asia/Tokyo',
        'Rio de Janeiro': 'America/Sao_Paulo',
        'São Paulo': 'America/Sao_Paulo',
        'Angkor Wat': 'Asia/Phnom_Penh',
        'Taj Mahal': 'Asia/Kolkata',
        'Bora Bora': 'Pacific/Tahiti',
        'Copacabana': 'America/Sao_Paulo'
    };
    
    // Find matching timezone
    let timeZone = null;
    for (let location in timeZones) {
        if (locationName.includes(location)) {
            timeZone = timeZones[location];
            break;
        }
    }
    
    if (!timeZone) {
        return null;
    }
    
    // Get current time in the destination's timezone
    const options = { 
        timeZone: timeZone, 
        hour12: true, 
        hour: 'numeric', 
        minute: 'numeric', 
        second: 'numeric',
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    };
    
    try {
        const localTime = new Date().toLocaleTimeString('en-US', options);
        return localTime;
    } catch (error) {
        console.error('Error getting time for', locationName, error);
        return null;
    }
}