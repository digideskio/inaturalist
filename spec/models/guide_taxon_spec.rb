# encoding: UTF-8
require File.dirname(__FILE__) + '/../spec_helper.rb'

describe GuideTaxon, "creation" do
  before(:all) do
    load_test_taxa
  end
  it "should add the taxon's wikipedia description as a GuideSection" do
    t = Taxon.make!(:wikipedia_summary => "foo bar")
    gt = GuideTaxon.make!(:taxon => t)
    gt.reload
    gt.guide_sections.should_not be_blank
    gt.guide_sections.first.description.should eq(t.wikipedia_summary)
  end

  it "should set the license for the default GuideSection to CC-BY-SA" do
    t = Taxon.make!(:wikipedia_summary => "foo bar")
    gt = GuideTaxon.make!(:taxon => t)
    gt.reload
    gt.guide_sections.first.license.should eq(Observation::CC_BY_SA)
  end

  it "should update the guide's taxon id" do
    g = Guide.make!
    g.taxon_id.should be_blank
    ancestor = Taxon.make!
    t1 = Taxon.make!(:parent => ancestor)
    t2 = Taxon.make!(:parent => ancestor)
    gt1 = without_delay { GuideTaxon.make!(:guide => g, :taxon => t1) }
    gt2 = without_delay { GuideTaxon.make!(:guide => g, :taxon => t2) }
    g.reload
    g.taxon_id.should eq(ancestor.id)
  end
end

describe GuideTaxon, "deletion" do
  it "should update the guide's taxon id" do
    without_delay do
      g = Guide.make!
      ancestor = Taxon.make!
      t1 = Taxon.make!(:parent => ancestor)
      t2 = Taxon.make!
      gt1 = GuideTaxon.make!(:guide => g, :taxon => t1)
      gt2 = GuideTaxon.make!(:guide => g, :taxon => t2)
      g.reload
      g.taxon_id.should be_blank
      gt2.destroy
      g.reload
      g.taxon_id.should eq t1.parent_id
    end
  end
end
