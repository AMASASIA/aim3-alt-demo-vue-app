pragma circom 2.0.0;

include "../node_modules/circomlib/circuits/poseidon.circom";

template VerifySecret() {
    // Public input: The confirmed fact hash (e.g., recorded on the SBT)
    signal input publicHash;
    
    // Private input: The local physical fact (e.g., silence duration metric)
    signal input secret;

    // Output: 1 if successful
    signal output out;

    // Poseidon hash initialization (1 input)
    component poseidon = Poseidon(1);
    poseidon.inputs[0] <== secret;

    // Verify the hashed secret matches the public hash
    publicHash === poseidon.out;
    
    out <== 1; // Output 1 on success
}

// Instantiate the component with publicHash exposed
component main {public [publicHash]} = VerifySecret();
