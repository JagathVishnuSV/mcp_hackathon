from flask import Flask, request, jsonify
from appium import webdriver
from appium.options.android import UiAutomator2Options
import time

app = Flask(__name__)

@app.route('/execute', methods=['POST'])
def execute():
    try:
        data = request.get_json()
        action = data.get("action")

        if action == "launch_app":
            app_package = data.get("app_package")
            app_activity = data.get("app_activity")
            device_name = data.get("device_name", "emulator-5554")

            options = UiAutomator2Options()
            options.set_capability("platformName", "Android")
            options.set_capability("deviceName", device_name)
            options.set_capability("appPackage", app_package)
            options.set_capability("appActivity", app_activity)
            options.set_capability("appWaitActivity", "*")
            options.set_capability("noReset", True)
            options.set_capability("forceAppLaunch", True)

            driver = webdriver.Remote("http://127.0.0.1:4723", options=options)
            driver.implicitly_wait(5)

    
            time.sleep(5)
            print(driver.current_activity)
            print(driver.page_source)

            driver.quit()
            return jsonify({"status": "App launched successfully!"})

        return jsonify({"error": "Invalid action"}), 400

    except Exception as e:
        return jsonify({"error": f"Appium failed: {str(e)}"}), 500


if __name__ == '__main__':
    app.run(port=5000, threaded=True)
