{pkgs ? import <nixpkgs> {}}:
pkgs.buildNpmPackage rec {
  pname = "splyd";
  version = (builtins.fromJSON (builtins.readFile ./package.json)).version;

  src = ./.;

  npmDeps = pkgs.importNpmLock {
    npmRoot = ./.;
  };

  npmConfigHook = pkgs.importNpmLock.npmConfigHook;

  # The prepack script runs the build script, which we'd rather do in the build phase.
  npmPackFlags = ["--ignore-scripts"];

  installPhase = ''
    runHook preInstall

    mkdir $out
    cp -R dist/* $out

    runHook postInstall
  '';
}
