#![allow(unused)]

use owned_ttf_parser::{self as ttf, AsFaceRef};
use std::fmt::Write;
use wasm_bindgen::prelude::*;

mod holders;
pub use holders::Point;

#[wasm_bindgen]
pub struct FontManager {
    face: ttf::OwnedFace,
}

#[wasm_bindgen]
pub fn initialize() {
    std::panic::set_hook(Box::new(console_error_panic_hook::hook));
}

#[wasm_bindgen]
pub fn fm_create() -> FontManager {

    let font_data = include_bytes!("../FiraCode-Regular.ttf");

    let face = match ttf::OwnedFace::from_vec(font_data.as_ref().to_owned(), 0) {
        Ok(f) => f,
        Err(e) => {
            eprint!("Error: {}.", e);
            std::process::exit(1);
        }
    };

    FontManager { face }
}

#[wasm_bindgen]
#[derive(Copy, Clone, Debug)]
pub enum DrawInstructionTag {
    MoveTo,
    LineTo,
    QuadTo,
    CurveTo,
    Close,
}

#[wasm_bindgen(getter_with_clone)]
#[derive(Clone, Debug)]
pub struct DrawInstruction {
    pub tag: DrawInstructionTag,
    pub point1: Point,
    pub point2: Point,
    pub point3: Point,
}

impl DrawInstruction {
    fn translate(&mut self, delta: &Point) {
        self.point1 += delta;
        self.point2 += delta;
        self.point3 += delta;
    }

    fn invert_y(&mut self, top_y: f32) {
        self.point1.y = top_y - self.point1.y;
        self.point2.y = top_y - self.point2.y;
        self.point3.y = top_y - self.point3.y;
    }

    fn scale(&mut self, factor: f32) {
        self.point1 *= factor;
        self.point2 *= factor;
        self.point3 *= factor;
    }
}

#[wasm_bindgen(getter_with_clone)]
#[derive(Clone)]
pub struct OutlineRender {
    pub instructions: Vec<DrawInstruction>,
    pub aabb: holders::Rect,
}

struct InstructionOutlineBuilder {
    instructions: Vec<DrawInstruction>,
}

impl InstructionOutlineBuilder {
    pub fn new() -> Self {
        Self {
            instructions: vec![],
        }
    }
}

impl ttf::OutlineBuilder for InstructionOutlineBuilder {
    fn move_to(&mut self, x: f32, y: f32) {
        self.instructions.push(DrawInstruction {
            tag: DrawInstructionTag::MoveTo,
            point1: Point::new(x, y),
            point2: Point::zero(),
            point3: Point::zero(),
        });
    }

    fn line_to(&mut self, x: f32, y: f32) {
        self.instructions.push(DrawInstruction {
            tag: DrawInstructionTag::LineTo,
            point1: Point::new(x, y),
            point2: Point::zero(),
            point3: Point::zero(),
        });
    }

    fn quad_to(&mut self, x1: f32, y1: f32, x: f32, y: f32) {
        self.instructions.push(DrawInstruction {
            tag: DrawInstructionTag::QuadTo,
            point1: Point::new(x1, y1),
            point2: Point::new(x, y),
            point3: Point::zero(),
        });
    }

    fn curve_to(&mut self, x1: f32, y1: f32, x2: f32, y2: f32, x: f32, y: f32) {
        self.instructions.push(DrawInstruction {
            tag: DrawInstructionTag::CurveTo,
            point1: Point::new(x1, y1),
            point2: Point::new(x2, y2),
            point3: Point::new(x, y),
        });
    }

    fn close(&mut self) {
        self.instructions.push(DrawInstruction {
            tag: DrawInstructionTag::Close,
            point1: Point::zero(),
            point2: Point::zero(),
            point3: Point::zero(),
        });
    }
}

#[wasm_bindgen]
pub fn fm_render_string(fm: &FontManager, text: &str) -> Vec<OutlineRender> {
    let face = fm.face.as_face_ref();

    let scale = 0.04;

    let mut renders = vec![];

    for c in text.chars() {
        let mut builder = InstructionOutlineBuilder::new();
        let mut bbox = face
            .glyph_index(c)
            .and_then(|id| face.outline_glyph(id, &mut builder))
            .unwrap();


        let w = ((bbox.width() as f32) * scale) as i16;
        let h = ((bbox.height() as f32) * scale) as i16;

        let translation = Point::new(bbox.x_min as f32, bbox.y_min as f32) * -1.0;

        for inst in builder.instructions.iter_mut() {
            inst.translate(&translation);
            inst.invert_y(bbox.height() as _);
            inst.scale(scale);
        }

        let render = OutlineRender {
            instructions: builder.instructions,
            aabb: holders::Rect {
                x_min: 0,
                y_min: 0,
                x_max: w,
                y_max: h,
            },
        };

        renders.push(render);

    }

    renders
}

// #[wasm_bindgen]
// pub fn fm_render_char(c: char, fm: &FontManager) -> OutlineRender {
//     let face = fm.face.as_face_ref();

//     let mut builder = InstructionOutlineBuilder::new();

//     let mut bbox = face
//         .glyph_index(c)
//         .and_then(|id| face.outline_glyph(id, &mut builder))
//         .unwrap();

//     let origin = &Point::new(bbox.x_min as f32, bbox.y_min as f32);

//     let scale = 0.1;

//     for i in 0..builder.instructions.len() {
//         let inst = &mut builder.instructions[i];

//         inst.point1.y = (bbox.y_max as f32) - inst.point1.y;
//         inst.point1 -= origin;
//         inst.point1 *= scale;

//         inst.point2.y = (bbox.y_max as f32) - inst.point2.y;
//         inst.point2 -= origin;
//         inst.point2 *= scale;

//         inst.point3.y = (bbox.y_max as f32) - inst.point3.y;
//         inst.point3 -= origin;
//         inst.point3 *= scale;
//         // println!("{:?}", inst);
//     }

//     bbox.x_max -= bbox.x_min;
//     bbox.y_max -= bbox.y_min;

//     // bbox.x_max *= (scale as i16);
//     // bbox.y_max *= (scale as i16);

//     bbox.x_min = 0;
//     bbox.y_min = 0;

//     OutlineRender {
//         instructions: builder.instructions,
//         aabb: bbox.into(),
//     }
// }
