function ajax(method, url, data, callback) {
      const xhr = new XMLHttpRequest();
      const fullUrl = apiBase + url;
      console.log('Making request to:', fullUrl);
      
      xhr.open(method, fullUrl, true);
      xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
          console.log('Response status:', xhr.status);
          console.log('Response text:', xhr.responseText);
          
          if (xhr.status === 200) {
            callback(JSON.parse(xhr.responseText));
          } else {
            console.error('Error:', xhr.status, xhr.statusText);
            alert(`Erreur ${xhr.status}: ${xhr.statusText}\nURL: ${fullUrl}`);
          }
        }
      };
      xhr.send(data);
    }