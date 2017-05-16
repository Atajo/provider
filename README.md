# Atajo Provider

The Atajo provider is a Git submodule that serves as the back end connector and source code host for you Atajo Mobile App.  

### Requirements
- NodeJS (Suggested v6.10.x LTS) 
- Git Project

### Installing and Running the Provider
1. Create / Checkout / Clone an empty project Git Repo
2. In the project folder, submodule this repo : 

```git submodule add https://github.com/Atajo/provider```

3. Run the provider for the first time : 

```node provider/start.js DEV```

4. The provider will create a directory structure and install required dependencies
5. Once done, you will have the following directory structure : 

6. You will also get the following error : 

7. Request keys from your Atajo account manager and add to the indicated file (```conf/keys.json```) e.g. 


8. Run the provider again : 

```node provider/start.js DEV```

9. You should now be connected to the Atajo Core as indicated by your release (```DEV | QAS | PRD```) 


### Installing and Running the Atajo Development Client
1. Download and Install the Atajo dev client application to your Android or Apple iPhone from the following link 

https://store.atajo.co.za/za.co.atajo.dev.client.aui

2. Run the app
3. Choose ```dev-1-0-1.core.atajo.co.za```
3. Generate a QRCode of your client key and scan with the app. 
4. Tap Continue
5. Your app will now load the code from your provider
6. You will see a connect event on your provider log

