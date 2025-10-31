import { supabase } from "@/config/supabaseClient";
import { getByFilter, getById, remove, update, upsert } from "@/services/storage";

import { Request, Response } from "express";

export const LeadController = {
  listLeads: async (req: Request, res: Response) => {
    const organizationId = Number(req.query.organizationId);
    try {
      const leads = await getByFilter<{ archived_at: Date; organization_id: number }>("leads", {
        organization_id: organizationId,
      });
      if (!leads) return res.status(404).json({ error: "No leads found" });
      return res.status(200).json(leads.filter((lead) => lead.archived_at === null));
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: "Error listing leads" });
    }
  },

  upsertLead: async (req: Request, res: Response) => {
    try {
      const payload = {
        organization_id: req.body.organizationId,
        name: req.body.name,
        company: req.body.company,
        email: req.body.email,
        phone: req.body.phone,
        value: req.body.value,
        source: req.body.source,
        priority: req.body.priority,
        observation: req.body.observation,
        tags: req.body.tags,
        status: req.body.status,
      };

      if (req.body.id && req.body.id > 0) {
        payload["id"] = req.body.id;
      }

      const response = await upsert("leads", payload);

      return res.json(response);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: "Error upserting lead" });
    }
  },

  deleteLead: async (req: Request, res: Response) => {
    const leadId = Number(req.params.id);
    try {
      const lead = await getById("leads", leadId);
      if (!lead) {
        return { status: 404, message: "Lead not found" };
      }

      await update("leads", leadId, { archived_at: new Date() });
      return res.status(204).json({ message: "Lead archived successfully" });
    } catch (error) {
      return res.status(500).json({ error: "Error archiving lead" });
    }
  },

  updateLeadStatus: async (req: Request, res: Response) => {
    const leadId = Number(req.params.id);
    let { status, columnName, organizationId } = req.body;

    if (!organizationId) {
      return res.status(400).json({ error: "Invalid organization ID" });
    }

    if (!status) {
      const response = await supabase
        .from("crm_columns")
        .select("id")
        .or("organization_id.is.null, organization_id.eq." + organizationId)
        .or("title_en.eq." + columnName + ",title_pt.eq." + columnName)
        .single();

      if (!response.data) {
        return res.status(404).json({ error: "Column not found" });
      }
      status = response.data.id;
    }

    try {
      const lead = await getById("leads", leadId);
      if (!lead) {
        return res.status(404).json({ error: "Lead not found" });
      }

      lead["status"] = status;
      const updatedLead = await upsert("leads", lead);
      return res.json(updatedLead);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: "Error updating lead status" });
    }
  },

  getLeadsCRMHistory: async (req: Request, res: Response) => {
    const organizationId = Number(req.query.organizationId);
    if (!organizationId) {
      return res.status(400).json({ error: "Invalid organization ID" });
    }
    try {
      const { data: leads, error } = await supabase.from("leads_status_history").select("*, leads!inner(*)")
      .eq("leads.organization_id", organizationId)
      if (error) {
        return res.status(500).json({ error: "Error getting leads CRM history", details: error });
      }
      return res.json(leads);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: "Error getting leads status history", details: error });
    }
  }
};
