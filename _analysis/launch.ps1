$chrome = "C:\Program Files\Google\Chrome\Application\chrome.exe"
$profile = "C:\Users\HP\Documents\GitHub\GPA\_analysis\chrome-profile"
$args = @(
  "--remote-debugging-port=9222",
  "--user-data-dir=$profile",
  "--no-first-run",
  "--no-default-browser-check",
  "--window-size=1440,900",
  "https://gpa.sarislabs.com/dashboard"
)
Start-Process -FilePath $chrome -ArgumentList $args
