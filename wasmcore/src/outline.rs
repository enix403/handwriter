use owned_ttf_parser as ttf;
use wasm_bindgen::prelude::*;

use crate::holders::{self, Point};

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
    pub fn translate(&mut self, delta: &Point) {
        self.point1 += delta;
        self.point2 += delta;
        self.point3 += delta;
    }

    pub fn invert_y(&mut self, top_y: f32) {
        self.point1.y = top_y - self.point1.y;
        self.point2.y = top_y - self.point2.y;
        self.point3.y = top_y - self.point3.y;
    }

    pub fn scale_y(&mut self, factor: f32) {
        self.point1.y *= factor;
        self.point2.y *= factor;
        self.point3.y *= factor;
    }

    pub fn scale(&mut self, factor: f32) {
        self.point1 *= factor;
        self.point2 *= factor;
        self.point3 *= factor;
    }
}

#[wasm_bindgen(getter_with_clone)]
#[derive(Clone)]
pub struct OutlineRender {
    pub instructions: Vec<DrawInstruction>,
    pub advance_width: u16,
    /// Left side bearing
    pub lsb: i16,
    pub upm: u16,
    // pub tight_width: i16,
    pub bbox: Option<holders::Rect>,

    pub capital_height: i16,
    pub ascender: i16,
    pub descender: i16,
}

// impl OutlineRender {
//     pub fn scaled(mut self, scale: f32) -> Self {
//         for inst in self.instructions.iter_mut() {
//             inst.scale(scale);
//         }
//         self.advance_width = ((self.advance_width as f32) * scale) as _;
//         self.lsb = ((self.lsb as f32) * scale) as _;
//         self.upm = ((self.upm as f32) * scale) as _;
//         self
//     }
// }

pub struct InstructionOutlineBuilder {
    pub instructions: Vec<DrawInstruction>,
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
