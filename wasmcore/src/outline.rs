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

#[wasm_bindgen(getter_with_clone)]
#[derive(Clone)]
pub struct OutlineRender {
    /// List of instructions
    pub instructions: Vec<DrawInstruction>,
    /// Advance Width
    pub advance_width: u16,
    /// Left side bearing
    pub lsb: i16,
    /// Tight Bouding Box
    pub bbox: Option<holders::Rect>,
}

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
