export const ENSRegistryABI = [
  // Authenticated Functions
  // --- Note: All modifiers should be removed from human readable ABI
  "function setSubnodeOwner(bytes32 node, bytes32 label, address owner) public returns(bytes32)",
  "function setResolver(bytes32 node, address resolver) public",
  // Events
  "event NewOwner(bytes32 indexed node, bytes32 indexed label, address owner)",
  "event NewResolver(bytes32 indexed node, address resolver)",
];
