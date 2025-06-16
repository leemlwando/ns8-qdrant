*** Settings ***
Library    SSHLibrary

*** Test Cases ***
Check if qdrant is installed correctly
    ${output}  ${rc} =    Execute Command    add-module ${IMAGE_URL} 1
    ...    return_rc=True
    Should Be Equal As Integers    ${rc}  0
    &{output} =    Evaluate    ${output}
    Set Suite Variable    ${module_id}    ${output.module_id}

Check if qdrant can be configured
    ${rc} =    Execute Command    api-cli run module/${module_id}/configure-module --data '{"http_port": 6333, "grpc_port": 6334, "log_level": "INFO"}'
    ...    return_rc=True  return_stdout=False
    Should Be Equal As Integers    ${rc}  0

Check if qdrant HTTP API works
    ${rc} =    Execute Command    curl -f http://127.0.0.1:6333/
    ...    return_rc=True  return_stdout=False
    Should Be Equal As Integers    ${rc}  0

Check if qdrant health endpoint works
    ${rc} =    Execute Command    curl -f http://127.0.0.1:6333/health
    ...    return_rc=True  return_stdout=False
    Should Be Equal As Integers    ${rc}  0

Check if qdrant collections endpoint works
    ${rc} =    Execute Command    curl -f http://127.0.0.1:6333/collections
    ...    return_rc=True  return_stdout=False
    Should Be Equal As Integers    ${rc}  0

Check get-status action
    ${rc} =    Execute Command    api-cli run module/${module_id}/get-status
    ...    return_rc=True  return_stdout=False
    Should Be Equal As Integers    ${rc}  0

Check get-configuration action
    ${rc} =    Execute Command    api-cli run module/${module_id}/get-configuration
    ...    return_rc=True  return_stdout=False
    Should Be Equal As Integers    ${rc}  0

Check if qdrant cleanup works
    ${rc} =    Execute Command    remove-module --no-preserve ${module_id}
    ...    return_rc=True  return_stdout=False
    Should Be Equal As Integers    ${rc}  0

Check if kickstart is removed correctly
    ${rc} =    Execute Command    remove-module --no-preserve ${module_id}
    ...    return_rc=True  return_stdout=False
    Should Be Equal As Integers    ${rc}  0
