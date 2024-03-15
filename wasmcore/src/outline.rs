use owned_ttf_parser as ttf;
use wasm_bindgen::prelude::*;

use crate::holders::{self, Point};

#[wasm_bindgen]
#[derive(Copy, Clone, Debug)]
pub enum DrawCommandTag {
    MoveTo,
    LineTo,
    QuadTo,
    CurveTo,
    Close,
}

#[wasm_bindgen(getter_with_clone)]
#[derive(Clone, Debug)]
pub struct DrawCommand {
    pub tag: DrawCommandTag,
    pub point: Point,
    pub control1: Point,
    pub control2: Point,
}

#[wasm_bindgen(getter_with_clone)]
#[derive(Clone)]
pub struct OutlineRender {
    /// List of instructions
    pub commands: Vec<DrawCommand>,
    /// Advance Width
    pub advance_width: u16,
    /// Left side bearing
    pub lsb: i16,
    /// Tight Bouding Box
    pub bbox: Option<holders::Rect>,
}

pub struct InstructionOutlineBuilder {
    pub commands: Vec<DrawCommand>,
}

impl InstructionOutlineBuilder {
    pub fn new() -> Self {
        Self {
            commands: vec![],
        }
    }
}


impl ttf::OutlineBuilder for InstructionOutlineBuilder {
    fn move_to(&mut self, x: f32, y: f32) {
        self.commands.push(DrawCommand {
            tag: DrawCommandTag::MoveTo,
            point: Point::new(x, y),
            control1: Point::zero(),
            control2: Point::zero(),
            // point1: Point::new(x, y),
            // point2: Point::zero(),
            // point3: Point::zero(),
        });
    }

    fn line_to(&mut self, x: f32, y: f32) {
        self.commands.push(DrawCommand {
            tag: DrawCommandTag::LineTo,
            point: Point::new(x, y),
            control1: Point::zero(),
            control2: Point::zero(),
            // point1: Point::new(x, y),
            // point2: Point::zero(),
            // point3: Point::zero(),
        });
    }

    fn quad_to(&mut self, x1: f32, y1: f32, x: f32, y: f32) {
        self.commands.push(DrawCommand {
            tag: DrawCommandTag::QuadTo,
            point: Point::new(x, y),
            control1: Point::new(x1, y1),
            control2: Point::zero(),
            // point1: Point::new(x1, y1),
            // point2: Point::new(x, y),
            // point3: Point::zero(),
        });
    }

    fn curve_to(&mut self, x1: f32, y1: f32, x2: f32, y2: f32, x: f32, y: f32) {
        self.commands.push(DrawCommand {
            tag: DrawCommandTag::CurveTo,
            point: Point::new(x, y),
            control1: Point::new(x1, y1),
            control2: Point::new(x2, y2),
            // point1: Point::new(x1, y1),
            // point2: Point::new(x2, y2),
            // point3: Point::new(x, y),
        });
    }

    fn close(&mut self) {
        self.commands.push(DrawCommand {
            tag: DrawCommandTag::Close,
            point: Point::zero(),
            control1: Point::zero(),
            control2: Point::zero(),
            // point1: Point::zero(),
            // point2: Point::zero(),
            // point3: Point::zero(),
        });
    }
}
