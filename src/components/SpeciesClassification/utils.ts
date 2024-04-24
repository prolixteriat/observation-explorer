
import { TSpeciesNameSchema } from '../../shared/hooks/nbn-atlas-api/useSpeciesNames';

// -----------------------------------------------------------------------------

const classificationBaseUrl = 'https://species.nbnatlas.org/species/';

const getSpeciesClassificationUrl = (tvk: string|null|undefined): string => 
    { return tvk ? classificationBaseUrl + tvk + '#classification' : '#'; }

// -----------------------------------------------------------------------------

export interface ITaxon {
    label: string;
    url: string
    value: string;
}
// -------

function makeTaxon(taxonomy: ITaxon[], label: string, value: string|null|undefined, 
                    tvk: string|null|undefined): void {

    if (value) {
        const taxon: ITaxon = {
            label: label,
            value: value ??= 'Not supplied',
            url: getSpeciesClassificationUrl(tvk)
        };
        taxonomy.push(taxon);
    }
}
// -------

export function makeTaxonomy(data: TSpeciesNameSchema|null|undefined): ITaxon[] {
    
    const taxonomy: ITaxon[] = [];
    if (data) {
        const tax = data.classification;
        makeTaxon(taxonomy, 'kingdom', tax.kingdom, tax.kingdomGuid);
        makeTaxon(taxonomy, 'phylum', tax.phylum, tax.phylumGuid);
        makeTaxon(taxonomy, 'subphylum', tax.subphylum, tax.subphylumGuid);
        makeTaxon(taxonomy, 'class', tax.class, tax.classGuid);
        makeTaxon(taxonomy, 'order', tax.order, tax.orderGuid);
        makeTaxon(taxonomy, 'suborder', tax.suborder, tax.suborderGuid);
        makeTaxon(taxonomy, 'superfamily', tax.superfamily, tax.superfamilyGuid);
        makeTaxon(taxonomy, 'family', tax.family, tax.familyGuid);
        makeTaxon(taxonomy, 'subfamily', tax.subfamily, tax.subfamilyGuid);
        makeTaxon(taxonomy, 'tribe', tax.tribe, tax.tribeGuid);
        makeTaxon(taxonomy, 'genus', tax.genus, tax.genusGuid);
        makeTaxon(taxonomy, 'species', tax.species, tax.speciesGuid);
    }
    return taxonomy;
}

// -----------------------------------------------------------------------------
// End
// -----------------------------------------------------------------------------
