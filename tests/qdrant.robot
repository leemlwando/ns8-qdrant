*** Settings ***
Library    SSHLibrary

*** Variables ***
${NODE_ADDR}    10.5.4.1
${SSH_KEY}      ~/.ssh/id_rsa
${IMAGE_URL}    ghcr.io/nethserver/qdrant:latest
${MODULE_ID}    qdrant1

*** Test Cases ***
Check if Qdrant module can be installed
    [Documentation]    Install the Qdrant module and check if it's working
    [Tags]    install
    ${output}  ${rc} =  Execute Command  add-module ${IMAGE_URL} 1    return_stdout=True    return_rc=True
    Should Be Equal As Integers    ${rc}    0
    Should Contain    ${output}    qdrant

Check if Qdrant module can be configured  
    [Documentation]    Configure the Qdrant module
    [Tags]    configure
    ${output}  ${rc} =  Execute Command  api-cli run configure-module --agent module/${MODULE_ID} --data '{"host": "qdrant.test.local", "http2https": true, "lets_encrypt": false}'    return_stdout=True    return_rc=True
    Should Be Equal As Integers    ${rc}    0

Check if Qdrant is running
    [Documentation]    Check if Qdrant service is active
    [Tags]    status
    ${output}  ${rc} =  Execute Command  runagent -m ${MODULE_ID} systemctl --user is-active qdrant.service    return_stdout=True    return_rc=True  
    Should Be Equal As Integers    ${rc}    0
    Should Be Equal As Strings    ${output}    active

Check if Qdrant module can be removed
    [Documentation]    Remove the Qdrant module
    [Tags]    remove
    ${output}  ${rc} =  Execute Command  remove-module --no-preserve ${MODULE_ID}    return_stdout=True    return_rc=True
    Should Be Equal As Integers    ${rc}    0

*** Keywords ***
Connect to the node
    Open Connection  ${NODE_ADDR}
    Login With Public Key  root  ${SSH_KEY}

*** Settings ***
Suite Setup    Connect to the node
Suite Teardown    Close All Connections
