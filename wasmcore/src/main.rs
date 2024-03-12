#![allow(unused)]

use owned_ttf_parser as ttf_parser;
use owned_ttf_parser::AsFaceRef;
use std::fmt::Write;
use wiggly_core::*;

// struct FontManager {}

// fn main() {
//     let fm = fm_create();
//     fm_render_char('h', &fm);
// }

struct Builder(String);

impl ttf_parser::OutlineBuilder for Builder {
    fn move_to(&mut self, x: f32, y: f32) {
        write!(&mut self.0, "M {} {} ", x, y).unwrap();
    }

    fn line_to(&mut self, x: f32, y: f32) {
        write!(&mut self.0, "L {} {} ", x, y).unwrap();
    }

    fn quad_to(&mut self, x1: f32, y1: f32, x: f32, y: f32) {
        write!(&mut self.0, "Q {} {} {} {} ", x1, y1, x, y).unwrap();
    }

    fn curve_to(&mut self, x1: f32, y1: f32, x2: f32, y2: f32, x: f32, y: f32) {
        write!(&mut self.0, "C {} {} {} {} {} {} ", x1, y1, x2, y2, x, y).unwrap();
    }

    fn close(&mut self) {
        write!(&mut self.0, "Z ").unwrap();
    }
}

fn main() {
    let font_data = include_bytes!("../FiraCode-Regular.ttf");

    let face = match ttf_parser::OwnedFace::from_vec(font_data.as_ref().to_owned(), 0) {
        Ok(f) => f,
        Err(e) => {
            eprint!("Error: {}.", e);
            std::process::exit(1);
        }
    };

    let face = face.as_face_ref();

    let mut builder = Builder(String::new());

    let bbox = face
        .glyph_index('p')
        .and_then(|id| face.outline_glyph(id, &mut builder))
        .unwrap();

    println!(
        "{} {} {} {}",
        bbox.x_min,
        bbox.y_min,
        bbox.width(),
        bbox.height()
    );
    println!(
        "x=\"{}\" y=\"{}\" width=\"{}\" height=\"{}\"",
        bbox.x_min,
        bbox.y_min,
        bbox.width(),
        bbox.height()
    );
    println!("{}", builder.0);
    println!("{}", bbox.y_min + bbox.y_max);
}

// let mut builder = Builder(String::new());

// let bbox = face
//     .glyph_index('z')
//     .and_then(|id| face.outline_glyph(id, &mut builder))
//     .unwrap();

// println!("{}", bbox.y_min + bbox.y_max);
// println!(
//     "{} {} {} {}",
//     bbox.x_min,
//     bbox.y_min,
//     bbox.x_max - bbox.x_min,
//     bbox.y_max - bbox.y_min
// );
// println!(
//     "x=\"{}\" y=\"{}\" width=\"{}\" height=\"{}\"",
//     bbox.x_min,
//     bbox.y_min,
//     bbox.x_max - bbox.x_min,
//     bbox.y_max - bbox.y_min
// );
// println!("{}", builder.0);

// fn main() {
//     let args: Vec<_> = std::env::args().collect();
//     if args.len() != 2 {
//         println!("Usage:\n\tfont-info font.ttf");
//         std::process::exit(1);
//     }

//     let font_data = std::fs::read(&args[1]).unwrap();

//     let now = std::time::Instant::now();

//     let face = match ttf_parser::Face::parse(&font_data, 0) {
//         Ok(f) => f,
//         Err(e) => {
//             eprint!("Error: {}.", e);
//             std::process::exit(1);
//         }
//     };

//     let mut family_names = Vec::new();
//     for name in face.names() {
//         if name.name_id == ttf_parser::name_id::FULL_NAME && name.is_unicode() {
//             if let Some(family_name) = name.to_string() {
//                 let language = name.language();
//                 family_names.push(format!(
//                     "{} ({}, {})",
//                     family_name,
//                     language.primary_language(),
//                     language.region()
//                 ));
//             }
//         }
//     }

//     let post_script_name = face
//         .names()
//         .into_iter()
//         .find(|name| name.name_id == ttf_parser::name_id::POST_SCRIPT_NAME && name.is_unicode())
//         .and_then(|name| name.to_string());

//     println!("Family names: {:?}", family_names);
//     println!("PostScript name: {:?}", post_script_name);
//     println!("Units per EM: {:?}", face.units_per_em());
//     println!("Ascender: {}", face.ascender());
//     println!("Descender: {}", face.descender());
//     println!("Line gap: {}", face.line_gap());
//     println!("Global bbox: {:?}", face.global_bounding_box());
//     println!("Number of glyphs: {}", face.number_of_glyphs());
//     println!("Underline: {:?}", face.underline_metrics());
//     println!("X height: {:?}", face.x_height());
//     println!("Weight: {:?}", face.weight());
//     println!("Width: {:?}", face.width());
//     println!("Regular: {}", face.is_regular());
//     println!("Italic: {}", face.is_italic());
//     println!("Bold: {}", face.is_bold());
//     println!("Oblique: {}", face.is_oblique());
//     println!("Strikeout: {:?}", face.strikeout_metrics());
//     println!("Subscript: {:?}", face.subscript_metrics());
//     println!("Superscript: {:?}", face.superscript_metrics());
//     println!("Permissions: {:?}", face.permissions());
//     println!("Variable: {:?}", face.is_variable());

//     #[cfg(feature = "opentype-layout")]
//     {
//         if let Some(ref table) = face.tables().gpos {
//             print_opentype_layout("positioning", table);
//         }

//         if let Some(ref table) = face.tables().gsub {
//             print_opentype_layout("substitution", table);
//         }
//     }

//     #[cfg(feature = "variable-fonts")]
//     {
//         if face.is_variable() {
//             println!("Variation axes:");
//             for axis in face.variation_axes() {
//                 println!(
//                     "  {} {}..{}, default {}",
//                     axis.tag, axis.min_value, axis.max_value, axis.def_value
//                 );
//             }
//         }
//     }

//     println!("Elapsed: {}us", now.elapsed().as_micros());
// }

// fn print_opentype_layout(name: &str, table: &ttf_parser::opentype_layout::LayoutTable) {
//     println!("OpenType {}:", name);
//     println!("  Scripts:");
//     for script in table.scripts {
//         println!("    {}", script.tag);

//         if script.languages.is_empty() {
//             println!("      No languages");
//             continue;
//         }

//         println!("      Languages:");
//         for lang in script.languages {
//             println!("        {}", lang.tag);
//         }
//     }

//     let mut features: Vec<_> = table.features.into_iter().map(|f| f.tag).collect();
//     features.dedup();
//     println!("  Features:");
//     for feature in features {
//         println!("    {}", feature);
//     }
// }
