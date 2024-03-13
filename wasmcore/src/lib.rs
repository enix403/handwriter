#![allow(unused)]

use std::cell::RefCell;
use std::collections::HashMap;
use std::fmt::Write;

use owned_ttf_parser::{self as ttf, AsFaceRef};
use wasm_bindgen::prelude::*;

mod outline;
use outline::{DrawInstruction, InstructionOutlineBuilder, OutlineRender};

mod holders;
pub use holders::Point;

#[wasm_bindgen]
pub struct FontManager {
    face: ttf::OwnedFace,
    outlines_cache: HashMap<char, OutlineRender>,
}

#[wasm_bindgen]
pub fn initialize() {
    std::panic::set_hook(Box::new(console_error_panic_hook::hook));
}

impl FontManager {
    fn new() -> Self {
        let font_data = include_bytes!("../FiraCode-Regular.ttf");

        let face = match ttf::OwnedFace::from_vec(font_data.as_ref().to_owned(), 0) {
            Ok(f) => f,
            Err(e) => {
                eprint!("Error: {}.", e);
                std::process::exit(1);
            }
        };

        FontManager {
            face,
            outlines_cache: HashMap::new(),
        }
    }

    fn outline_glyph(&mut self, c: char) -> &OutlineRender {
        let face = self.face.as_face_ref();

        let glyph_id = face.glyph_index(c).unwrap();

        let mut builder = InstructionOutlineBuilder::new();
        let mut bbox = face.outline_glyph(glyph_id, &mut builder).unwrap();

        let upm = face.units_per_em();
        let mirror = upm / 2;
        let descender = face.descender();

        let baseline = mirror as f32;

        for inst in builder.instructions.iter_mut() {
            inst.translate(&Point::new(0.0, baseline));
            inst.invert_y(mirror as _);
        }

        let render = OutlineRender {
            instructions: builder.instructions,
            advanced_width: face.glyph_hor_advance(glyph_id).unwrap_or_else(|| {
                bbox.width() as _
            }),
            lsb: face.glyph_hor_side_bearing(glyph_id).unwrap_or(0),
            tight_width: bbox.width(),
            tight_height: bbox.height(),
            // aabb: holders::Rect {
            //     x_min: 0,
            //     y_min: 0,
            //     x_max: bbox.width(),
            //     y_max: bbox.height(),
            // },
        };

        self.outlines_cache.insert(c, render);
        self.outlines_cache.get(&c).unwrap()
    }
}

#[wasm_bindgen]
pub fn fm_create() -> FontManager {
    FontManager::new()
}

#[wasm_bindgen]
pub fn fm_render_string(fm: &mut FontManager, text: &str, font_size: f32) -> Vec<OutlineRender> {
    let face = fm.face.as_face_ref();

    // let point_size = 52 as f32;
    let resolution = 72 as f32;
    let units_per_em = face.units_per_em() as f32;

    // let scale = point_size * resolution / (72.0 * units_per_em);
    let scale = 1.0 / units_per_em * font_size;

    text.chars()
        .map(|c| fm.outline_glyph(c).clone().scaled(scale))
        .collect()

    // let mut renders = vec![];

    // for c in text.chars() {
    //     let mut render = fm.outline_glyph(c);
    //     renders.push(render.clone().scaled(scale));
    // }

    // renders
}
