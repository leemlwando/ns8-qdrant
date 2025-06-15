*** Settings ***
Library    SSHLibrary

*** Test Cases ***
Check if Qdrant is installed correctly
    ${output}  ${rc} =    Execute Command    add-module ${IMAGE_URL} 1
    ...    return_rc=True
    Should Be Equal As Integers    ${rc}  0
    &{output} =    Evaluate    ${output}
    Set Suite Variable    ${module_id}    ${output.module_id}

Check if Qdrant can be configured
    ${rc} =    Execute Command    api-cli run configure-module --agent module/${module_id} --data '{"host": "qdrant.test.local", "port": 6333}'
    ...    return_rc=True  return_stdout=False
    Should Be Equal As Integers    ${rc}  0

Check if Qdrant is running
    ${output}  ${rc} =    Execute Command    api-cli run get-status --agent module/${module_id}
    ...    return_rc=True
    Should Be Equal As Integers    ${rc}  0

Check if Qdrant is removed correctly
    ${rc} =    Execute Command    remove-module --no-preserve ${module_id}
    ...    return_rc=True  return_stdout=False
    Should Be Equal As Integers    ${rc}  0
