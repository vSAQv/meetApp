{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {
  buildInputs = with pkgs; [
    jdk17
    maven
    nodejs_20
  ];

  shellHook = ''
    echo "========================================="
    echo "  🚀 Среда для Meet App загружена!"
    echo "  Java: $(java -version 2>&1 | head -n 1)"
    echo "  Maven: $(mvn -version | head -n 1)"
    echo "  Node.js: $(node -v)"
    echo "========================================="
  '';
}
