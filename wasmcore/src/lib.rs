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
        // let font_data = include_bytes!("../FiraCode-Regular.ttf");
        // let font_data = include_bytes!("../Roboto-Regular.ttf");
        let font_data = include_bytes!("../Poppins-Regular.ttf");

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

    // fn outline_glyph(&mut self, c: char) -> &OutlineRender {
    //     let face = self.face.as_face_ref();

    //     let glyph_id = face.glyph_index(c).expect("Glyph not found");

    //     let mut builder = InstructionOutlineBuilder::new();
    //     let mut bbox = face.outline_glyph(glyph_id, &mut builder);

    //     let upm = face.units_per_em();
    //     let half_upm = (upm / 2) as f32;
    //     let baseline = half_upm as f32;

    //     for inst in builder.instructions.iter_mut() {
    //         inst.translate(&Point::new(0.0, baseline));
    //         inst.invert_y(half_upm);
    //     }

    //     let width = bbox
    //         .map(|bbox| bbox.width())
    //         .unwrap_or_else(|| face.global_bounding_box().width());

    //     let advance_width = face
    //         .glyph_hor_advance(glyph_id)
    //         .unwrap_or_else(|| width as _);

    //     let render = OutlineRender {
    //         instructions: builder.instructions,
    //         advance_width,
    //         lsb: face.glyph_hor_side_bearing(glyph_id).unwrap_or(0),
    //         upm
    //     };

    //     self.outlines_cache.insert(c, render);
    //     self.outlines_cache.get(&c).unwrap()
    // }

    fn outline_glyph(&mut self, c: char) -> &OutlineRender {
        let face = self.face.as_face_ref();

        let glyph_id = face.glyph_index(c).expect("Glyph not found");

        let mut builder = InstructionOutlineBuilder::new();
        let mut bbox = face.outline_glyph(glyph_id, &mut builder);

        let upm = face.units_per_em();

        let width = bbox
            .map(|bbox| bbox.width())
            .unwrap_or_else(|| face.global_bounding_box().width());

        let advance_width = face
            .glyph_hor_advance(glyph_id)
            .unwrap_or_else(|| width as _);

        let render = OutlineRender {
            instructions: builder.instructions,
            advance_width,
            lsb: face.glyph_hor_side_bearing(glyph_id).unwrap_or(0),
            upm,
            bbox: bbox.map(|bbox| bbox.into()),
            capital_height: face.capital_height().unwrap_or(0),
            ascender: face.ascender(),
            descender: face.descender(),
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
        .map(|c| fm.outline_glyph(c).clone())
        .collect()

    // let mut renders = vec![];

    // for c in text.chars() {
    //     let mut render = fm.outline_glyph(c);
    //     renders.push(render.clone().scaled(scale));
    // }

    // renders
}

#[wasm_bindgen]
pub fn fm_render_char(fm: &mut FontManager, c: char) -> OutlineRender {
    fm.outline_glyph(c).clone()
}
