use clap::{Arg, Command};

use std::{
    fs::{self, File},
    io::Write,
    path::PathBuf,
    process,
};

fn main() {
    let matches = Command::new("monitext")
        .version("3.0.0")
        .about("MoniText CLI utility")
        .subcommand_required(true)
        .subcommand(
            Command::new("init")
                .about("Generate a MoniText runtime config file")
                .arg(
                    Arg::new("output")
                        .short('o')
                        .long("output")
                      .value_name("file")
                        .help("Output file path")
                        .default_value("monitext.runtime.ts"),
                )
                .arg(
                    Arg::new("apiKey")
                        .long("apiKey")
                        .value_name("key")
                        .help("Set the default API key")
                        .default_value(""),
                )
                .arg(
                    Arg::new("project")
                        .long("project")
                        .value_name("name")
                        .help("Set the default project name")
                        .default_value(""),
                )
                .arg(
                    Arg::new("mode")
                        .long("mode")
                        .value_name("env")
                        .help("Set formatting mode: dev | prod")
                        .default_value("dev"),
                ),
        )
        .get_matches();

    if let Some(init_args) = matches.subcommand_matches("init") {
        let output = init_args.get_one::<String>("output").unwrap();
        let api_key = init_args.get_one::<String>("apiKey").unwrap();
        let project = init_args.get_one::<String>("project").unwrap();
        let mode = init_args.get_one::<String>("mode").unwrap();

        let path_buf = PathBuf::from(".");
        let path = path_buf.as_path();
        let file_path = PathBuf::from(output);
        let dir = file_path.parent().unwrap_or_else(|| path);

        let content = format!(
            r#"import {{ createRuntime, getPolicyRecord }} from "monitext";

const {{ createFormating, createConfig, policies }} = getPolicyRecord("default");

const format = createFormating({{
  mode: "{mode}",
  success: {{ 
    showColumnNumber: false,
    showFullTrace: false
  }},
}});

const config = createConfig({{
  apiKey: "{api_key}",
  project: "{project}",
  silence: ["info"]
}});

export const {{ monitext, mtxt }} = createRuntime({{ config, load: [...policies], format }});
"#
        );

        // Create directory if needed
        if !dir.exists() {
            if let Err(e) = fs::create_dir_all(dir) {
                eprintln!("❌ Failed to create output directory: {}", e);
                process::exit(1);
            }
        }

        // Write file
        match File::create(&file_path).and_then(|mut f| f.write_all(content.as_bytes())) {
            Ok(_) => println!(
                "✅ MoniText runtime initialized at: {}",
                file_path.display()
            ),
            Err(e) => {
                eprintln!("❌ Failed to write MoniText runtime file: {}", e);
                process::exit(1);
            }
        }
    }
}
