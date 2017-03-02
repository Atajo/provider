# NodeJS - SAP Netweaver RFC for Atajo Provider

## Description

This module provides bindings to the SAP Netweaver RFC SDK. With it, you will be able to call remote enabled function modules of a SAP system.
Opening the connection and function invocations are fully/partially asynchronous operations, which will call a callback function upon completion.

### Linux

- Copy the files from the lib and include folders under nwrfcsdk_LINUX to the corresponding system directories (/usr/local/Lib /usr/local/include)

```
cd nwrfcsdk_LINUX
cp ./lib/* /usr/lib
cp ./include/* /usr/include
```

### Windows

- Copy the files from the nwrfcsdk_WIN64\lib directory to C:\Windows\system32
- Warning: If you are working with NodeJS 32-bit on a Windows 64-bit OS, you should copy the files to C:\Windows\SysWOW64 instead.

### OS X

OS X is **not supported** due to the fact that there is no suitable SAP RFC NW SDK available. The module will compile but fail when trying to lazy-load its dependencies.


## Installation (both Linux and Windows)

- You may now download the addon from the [npm registry](http://search.npmjs.org) and install it by using the `npm` command.

```sh
npm install sapnwrfc
```

## Configuration 

- Create a configuration file in the project ```conf``` directory called ```sap.json``` ( $PROJECT_DIR\conf\sap.json ) 
- Copy and Paste the following into it and complete the details as per the SAP system(s) your are integrating with

```
{
    "DEV": {
        "ashost": "10.0.0.1",
        "sysid": "ECQ",
        "sysnr": "00",
        "user": "username",
        "passwd": "password",
        "client": "100",
        "lang": "E"  
     },

    "QAS": {
         "ashost": "10.0.0.1",
        "sysid": "ECQ",
        "sysnr": "00",
        "user": "username",
        "passwd": "password",
        "client": "100",
        "lang": "E" 
    },

    "PRD": {
        "ashost": "10.0.0.2",
        "sysid": "PRD",
        "sysnr": "00",
        "user": "username",
        "passwd": "password",
        "client": "100",
        "lang": "E" 
    }

}


```


